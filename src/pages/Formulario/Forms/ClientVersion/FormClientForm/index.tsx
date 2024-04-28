'use client'


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MdSend } from "react-icons/md";

import FileForge from "@/src/modules/FileForge";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from "react";
import { useForm } from 'react-hook-form';
import { mask } from "remask";
import z from "zod";


function FromButton({ text }:{ text:string  }) {

    return (
        <button type="submit" className="bg-[rgba(18,18,25,.8)] rounded shadow-sm p-3 w-full mt-[15px]" >
            <div className="flex items-center justify-center gap-2" >
                <MdSend color="white" size={20} />
                <span className="text-lg font-bold text-white" >{text}</span>
            </div>
        </button>
    );
};


const fromSchema = z.object({
    name:z.string().trim().min(3, {message:'Deve conter no mínimo 3 caracteres'}).transform(text => text.split(' ').map(item => item[0].toUpperCase() + item.slice(1)).join(' ')),
    email:z.string().trim().email({message:'Deve ser um email válido'}),
    whatsapp:z.string().min(16, {message:'Deve conter 11 caracteres'}).max(16, {message:'Deve conter 11 caracteres'}).transform(text => text.replaceAll(/\D/g, '')),
    documents:z.custom<FileList>((value) => {
        if (value instanceof FileList) { return value } else throw new Error('Valor inválido para FileList');
    }).refine(files => files.length > 0, {message:'Deve conter pelo menos um arquivo inserido'}).refine(files => Array.from(files).filter(item => {
        const typeImage = new RegExp('image/', 'i');
        const typePDF = new RegExp('pdf', 'i');
        return !typeImage.test(item.type) && !typePDF.test(item.type);
    }).length === 0, {message:'Os arquivos devem ser em formato imagem ou pdf'}),
});



type FromSchema = z.infer<typeof fromSchema>;

function ErrorSpan({ text }:{text?:string}) {

    return (
        <span className="text-red-500 font-light text-base" >{text ?? ''}</span>
    );
};



export type FormsDataCustom = Omit<FromSchema, 'documents'> & {documents:{name:string, type:string, size:number, base64:string}[], id:string};
function localStorageAddForm(data:FormsDataCustom) {
    const storedData = localStorage.getItem('forms');
    const storedArray = storedData ? JSON.parse(storedData) : [];
    const dataToStore = JSON.stringify([...storedArray, data]);
    localStorage.setItem('forms', dataToStore);    
};
export function localStorageGetForms() {
    const storedData = localStorage.getItem('forms');
    const storedArray = storedData ? JSON.parse(storedData) : [];
    return storedArray as FormsDataCustom[];
};
export function localStorageRemoveForms(id:string) {
    const storedData = localStorage.getItem('forms');
    const storedArray = (storedData ? JSON.parse(storedData) : []) as FormsDataCustom[];
    const filteredArray = storedArray.filter(item => item.id !== id);
    localStorage.setItem('forms', JSON.stringify(filteredArray));
    return filteredArray;
};


export default function FormClientForm({ handleSubmit:handleSubmitSuccess }: {handleSubmit:() => void}) {

    const globalState = useGlobalProvider();
    const [, setPublicError] = globalState.publicError;

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FromSchema>({ resolver:zodResolver(fromSchema) });

    const whatsapp = watch('whatsapp');

    useEffect(() => {
        setValue('whatsapp', mask(whatsapp ?? '', ['(99) 9 9999-9999']))
    }, [whatsapp]);

    async function checkData(data:FromSchema) {
        try {
            
            console.log(data);
            const documents = await Promise.all(Array.from(data.documents).map(async (item) => {
                const file = new FileForge({file:item})
                // alert(JSON.stringify(file.fileData, null, 2))
                const blob = await file.blob();
                const base64 = await file.base64();            
                return {name:item.name, type:item.type, size:item.size, base64};
            }))
            // console.log(documents);
            const id = `${new Date().getTime()}`;
            const toStore = {
                ...data,
                documents,
                id,
            }
            localStorageAddForm(toStore);
            const forms = localStorageGetForms();
            console.log('forms --->>', forms)
            handleSubmitSuccess()
        } catch (e:any) {
            const regExp = new RegExp(`Failed to execute 'setItem' on 'Storage'`, 'ig')
            if (regExp.test(e.message)) {
                setPublicError({
                    title:'Armazenamento cheio', 
                    message:`Esta é apenas uma apresentação do formulário, por isso o armazenamento é limitado.
                    
                    Para continuar fazer os testes, apague alguns registros na sessão de administrador, ou selecione documentos mais leves.`
                })
            } else alert(JSON.stringify(e, null, 2));
        }
    }

    return (        
        <form onSubmit={handleSubmit(checkData)} className="flex items-start justify-center flex-col gap-2 w-full" >
            <Input placeholder="Nome" className="text-lg" {...register('name')}  />
            {errors.name && <ErrorSpan text={errors.name.message} />}
            <Input placeholder="Email" type="email" className="text-lg" {...register('email')}  />
            {errors.email && <ErrorSpan text={errors.email.message} />}
            <Input placeholder="Whatsapp" type="tel" className="text-lg" {...register('whatsapp')}  />
            {errors.whatsapp && <ErrorSpan text={errors.whatsapp.message} />}
            <Label htmlFor="document" className="flex self-start" >Insira um PDF ou Imagem</Label>
            <Input type="file" id="document" accept="image/*,.pdf" multiple {...register('documents')} className="cursor-pointer" />
            {errors.documents && <ErrorSpan text={errors.documents.message} />}
            <FromButton text="Enviar" />
        </form>
    );

};