

import {
    ColumnDef
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { mask } from 'remask';
  
  import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import FileForge from "@/src/modules/FileForge";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import cutTextMask from "@/utils/functions/masks/cutTextMask";
import { FormsDataCustom, localStorageRemoveForms } from "../../../ClientVersion/FormClientForm";


export default function columns(resetData:() => void):ColumnDef<FormsDataCustom>[] {

    const globalState = useGlobalProvider();
    const [, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;

    return dimensions && [  
        {
          accessorKey: "nome",
          header: "Nome",
          cell: ({ row }) => {
              const form = row.original
              return <div className="capitalize">{form.name}</div>
      },
        },
        {
          accessorKey: "email",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Email
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
          },
          cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
        },
        {
          accessorKey: "whatsapp",
          header: () => <div className="text-center">Whatsapp</div>,
          cell: ({ row }) => {
            const number = row.getValue("whatsapp") as string;
      
            // Format the amount as a dollar amount
            const formatted = mask(number, ['99 9 9999-9999'])
      
            return <div className="text-center font-medium w-auto text-nowrap">{formatted}</div>
          },
        },
        {
          
          accessorKey: "documentos",
          header: () => <div className="text-center">Documentos</div>,
          cell: ({ row }) => {
            const form = row.original
      
            function reduceFileName(fileName:string) {
              const name = fileName.split('.')[0];
              return cutTextMask(name, 25) + `.${fileName.split('.')[1]}`
            }
      
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 p-0 w-full">
                    <span className="text-center">{form.documents.length} documentos</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Visualizar</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {form.documents.map((item, i) => (
                      <DropdownMenuItem key={item.size + i} onClick={async () => await (new FileForge({ base64:item.base64 })).open()} >{reduceFileName(item.name)}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          },
        },
        {
          id: "actions",
          enableHiding: false,
          cell: ({ row, table }) => {
            const form = row.original
            function removeItem(id:string) {
                localStorageRemoveForms(id);
                resetData();
            }
      
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(form.whatsapp)}
                  >
                    Copiar Whatsapp
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => removeItem(form.id)} className="bg-red-400 hover:bg-red-700 cursor-pointer text-white" >Deletar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          },
        },
      ]
} 