/**
 * @author Jörn Kreutel
 * Modifiziert durch Benito Ernst, Arthur Muszynski
 */
import { MyApplication, mwf } from "../Main.js";
import { entities } from "../Main.js";

export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    // custom instance attributes for this controller
    items;
    addNewMediaItemElement;
    crudOperationState;

    constructor() {
        super();
        console.log("ListviewViewController()");

        this.crudOperationState = "local";

        this.items = [
            new
                entities.MediaItem("m1", "https://picsum.photos/100/100"),
            new
                entities.MediaItem("m2", "https://picsum.photos/200/150"),
            new
                entities.MediaItem("m3", "https://picsum.photos/150/200")
        ];
    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {

        // TODO: do databinding, set listeners, initialise the view
        this.addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");

        this.addNewMediaItemElement.onclick = (() => {
            this.createNewItem();
        });

        this.switchRepoElement = this.root.querySelector("#switchRepoItem");

        this.switchRepoElement.onclick = (() => {
            this.switchCRUDOperation();
        });


        entities.MediaItem.readAll().then((items) => {
            this.initialiseListview(items);
        });

        this.crudOperationStateElement = this.root.querySelector("#crudOperationState");
        this.crudOperationStateElement.innerHTML = this.application.currentCRUDScope;

        // call the superclass once creation is done
        super.oncreate();
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
        super.onListItemMenuItemSelected(menuitemview, itemobj, listview);
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialogview, dialogdataobj) {
        // call the supertype function
        super.bindDialog(dialogid, dialogview, dialogdataobj);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
        if (nextviewid == "mediaReadview" && returnValue && returnValue.deletedItem) {
            this.removeFromListview(returnValue.deletedItem._id);
        }
    }

    deleteItem(item) {
        /*item.delete(() => {
            this.removeFromListview(item._id);
        });*/

        this.showDialog("mediaItemDeleteDialog", {
            item: item,
            actionBindings: {
                
                submitForm: ((event) => {
                    event.original.preventDefault();
                    this.removeFromListview(item._id);
                    this.hideDialog();

                }),
                cancelDeleteItem: ((event) => {
                    this.hideDialog();
                })
            }
        });
    }

    editItem(item) {
        this.showDialog("mediaItemDialog", {
            item: item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    item.update().then(() => {
                        this.updateInListview(item._id, item);
                    });
                    this.hideDialog();
                }),/*!!!*/
                deleteItem: ((event) => {
                    this.deleteItem(item);
                    this.hideDialog();
                })
            }
        });
    }

    createNewItem() {
        var newItem = new entities.MediaItem("", "https://picsum.photos/100/100");
        this.showDialog("mediaItemDialog", {
            item: newItem,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    newItem.create().then(() => {
                        this.addToListview(newItem);
                    });
                    this.hideDialog();
                })
            }
        });
    }

    switchCRUDOperation() {

        if(this.application.currentCRUDScope == "local"){
            this.application.switchCRUD("remote");
        } else {
            this.application.switchCRUD("local");
        }

        entities.MediaItem.readAll().then((items) => {
            this.initialiseListview(items);
        });

        this.crudOperationStateElement = this.root.querySelector("#crudOperationState");
        this.crudOperationStateElement.innerHTML = this.application.currentCRUDScope;
    }
}