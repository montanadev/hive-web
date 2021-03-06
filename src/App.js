import './App.css';
import {useEffect, useState} from "react";
import MaterialTable from "material-table";
import {Button} from "@material-ui/core";
import DeleteItemModal from "./DeleteItemModal";
import NewItemModal from "./NewItemModal";
import {ToastContainer} from 'react-toastify';
import PrintLabelModal from "./PrintLabelModal";
import ScannerModal from "./ScannerModal";
import {Api} from "./Api";
import {toastError, toastSuccess} from "./utils";
import NewLocationModal from "./NewLocationModal";
import EditImageModal from "./EditImageModal";
import EnvironmentSwitcher from "./EnvironmentSwitcher";

function App() {
    const [items, setItems] = useState([]);
    const [editImage, setEditImage] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [locations, setLocations] = useState([]);
    const [pendingDeleteUPC, setPendingDeleteUPC] = useState(null);
    const [pendingCreate, setPendingCreate] = useState(false);
    const [newLocationOpen, setNewLocationOpen] = useState(false);
    const [printLabelOpen, setPrintLabelOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [env, setEnv] = useState('remote');

    const api = new Api(env);

    useEffect(() => {
        api.loadItems().then(items => setItems(items));
        api.loadLocations().then(locations => setLocations(locations))
    }, [env]);

    return (
        <div>
            <ToastContainer/>

            <DeleteItemModal
                open={pendingDeleteUPC !== null}
                onDelete={() => api.deleteItem(pendingDeleteUPC)}
                onClose={() => setPendingDeleteUPC(null)}/>

            <NewItemModal
                open={pendingCreate}
                onClose={() => setPendingCreate(false)}
                onCreate={(name, print, image) =>
                    api.newItem(name, print, image)
                }/>

            <NewLocationModal
                open={newLocationOpen}
                locations={locations ?? []}
                onClose={() => setNewLocationOpen(false)}
                onCreate={(name, print) =>
                    api.newLocation(name, print)
                }/>

            <PrintLabelModal
                open={printLabelOpen}
                onPrint={(upc, description) => api.print(upc, description)}
                onClose={() => setPrintLabelOpen(false)}/>

            <ScannerModal
                open={scannerOpen}
                onMoveItem={api.moveItem}
                onClose={() => setScannerOpen(false)}/>

            <EditImageModal
                open={selectedItem !== null}
                image={editImage}
                onDelete={() => {
                    api.deleteImage(selectedItem);
                }}
                onCreate={(image) => {
                    api.newImage(image, selectedItem)
                }}
                onClose={() => {
                    setEditImage(null);
                    setSelectedItem(null);
                }}/>

            <div style={{display: 'flex'}}>
                <h1 style={{paddingRight: 10, paddingLeft: 10}}>Hive</h1>

                <Button variant="contained" onClick={() => setPendingCreate(true)}>
                    New item
                </Button>
                <Button variant="contained" onClick={() => setNewLocationOpen(true)}>
                    New location
                </Button>
                <Button variant="contained" onClick={() => setPrintLabelOpen(true)}>
                    Print label
                </Button>
                <Button variant="contained" onClick={() => setScannerOpen(true)}>
                    Scanner
                </Button>

                <EnvironmentSwitcher onSwitchEnvironment={setEnv} env={env}/>
            </div>

            <MaterialTable
                columns={[
                    {title: 'UPC', field: 'upc'},
                    {title: 'Name', field: 'name'},
                    {title: 'Touched', field: 'touched'},
                    {title: 'Location', field: 'location.name'},
                ]}
                data={items}
                options={{pageSize: 100, pageSizeOptions: [100, 200, 1000], showTitle: false, actionsColumnIndex: 4}}
                actions={[
                    (rowData) => {
                        return {
                            icon: () =>
                                <img src={`${api.apiUrl}/api/items/${rowData.upc}/image`} style={{width: "50px"}}/>,
                            tooltip: 'Image',
                            onClick: (event, rowData) => {
                                setEditImage(rowData.image);
                                setSelectedItem(rowData.upc);
                            }
                        }
                    },
                    {
                        icon: 'delete',
                        tooltip: 'Delete Item',
                        onClick: (event, rowData) => {
                            setPendingDeleteUPC(rowData.upc);
                        }
                    },
                    {
                        icon: 'print',
                        tooltip: 'Print Item',
                        onClick: (event, rowData) => {
                            api.print(rowData.upc, rowData.name).then(() => {
                                toastSuccess('Printed label successfully!');
                            }).catch(e => {
                                toastError(`Failed to print label: ${e.toString()}`);
                            });
                        }
                    }
                ]}/>
        </div>
    );
}

export default App;
