import { ClientReplicationForm } from "../components/ClientReplicationForm";
import { DeleteUsersButton } from "../components/DeleteUsersButton";
import { ProviderReplicationForm } from "../components/ProviderReplicationForm";

function Replicas() {
    return (
        <div>
            <h1 className="text-center text-2xl font-bold mx-auto my-4">Replicas</h1>
            {/* Aquí iría el contenido de la página de tickets */}
            <div className="grid grid-cols-2 gap-4 w-1/2 mx-auto my-8">

                <ProviderReplicationForm/>
                <ClientReplicationForm/>
            </div>
            <div className="w-1/2 mx-auto">
            <DeleteUsersButton/>

            </div>
        </div>
    );
}

export default Replicas;
