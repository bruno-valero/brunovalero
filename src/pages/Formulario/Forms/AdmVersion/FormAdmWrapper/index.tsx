'use client';

import colors from "@/src/constants/colors";
import FileForge from "@/src/modules/FileForge";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useState } from "react";
import { FaFileCsv } from "react-icons/fa6";
import { localStorageGetForms } from "../../ClientVersion/FormClientForm";
import FormsTable from "./FormsTable";


export default function FormAdmWrapper() {

    const globalState = useGlobalProvider();
    const [, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;

    const [forms, setForms] = useState(localStorageGetForms());

    function resetData() {
        setForms(localStorageGetForms());
    };

    async function exportToCSV() {
        const csvHeader = forms?.map((form) => Object.keys(form).join(','))[0]
        const csvBody = forms?.map((form) => Object.values(form).map(item => item instanceof Array ? `${item.length} arquivos (contrate o serviço para obter os links dos arquivos)` : item ).join(','))        
        const csv = `${csvHeader}\n${csvBody?.join('\n')}`;

        const file = new FileForge({rawData:{data:csv, type:'text/csv;charset=utf-8;'}});
        await file.download();
    }
    

    return (
        dimensions &&
        <div className="flex items-center justify-center flex-col bg-white w-full shadow rounded px-[50px] py-[25px] my-5" >

            <button onClick={exportToCSV} className="p-3 w-full my-1 flex items-center justify-center gap-2 rounded shadow" style={{backgroundColor:colors.excel(.7)}} >
                <FaFileCsv color='white' size={30} />
                <span className="text-white text-xl font-semibold" >
                    Exportar CSV
                </span>
            </button>

            <FormsTable data={forms ?? []} resetData={resetData} />

            
        </div>
    );

};