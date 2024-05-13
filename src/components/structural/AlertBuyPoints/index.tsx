'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const pointsSchema = z.object({
  points:z.coerce.number().min(5, `A compra de créditos é permitida apenas acma de R$5,00`),
});

type Points = z.infer<typeof pointsSchema>;
  
export function AlertBuyPoints() {

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const globalState = useGlobalProvider();
  const globalUser = globalState.globalUser;
  const [alertBuyPoints, setAlertBuyPoints] = globalState.alertBuyPoints;
  const { envs } = globalState.fromServer;

  const [loading, setLoading] = useState(false);

  const { formState:{ errors }, handleSubmit, register } = useForm<Points>({ resolver:zodResolver(pointsSchema) })

  useEffect(() => {    
    if (alertBuyPoints.alert) {
        triggerRef.current?.click();
    };
  }, [alertBuyPoints.alert]);

  async function buyPoints(data: Points) {
    if (!globalUser.data?.uid) return;
    setLoading(true);

    const cloudFunction = 'https://southamerica-east1-brunovalero-49561.cloudfunctions.net/readPdfBuyCredits';
    const apiPath = '/api/readPdf/buy-credits';
    const url = envs.useCloudFunctions ? cloudFunction : apiPath;
    const post = new Post(url);
    post.addData({ uid:globalUser.data.uid, amount:data.points });

    const resp = await post.send();
    const respData = await resp?.json() as { data?:boolean, error?:string };

    setLoading(false);
    closeRef.current?.click();
  } 

  return (
    <AlertDialog onOpenChange={(e) => !e && setAlertBuyPoints({message:'', title:'', alert:false})} >
      <AlertDialogTrigger ref={triggerRef} className="hidden" asChild >
        <Button variant="outline">Show Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {alertBuyPoints.title ?? `Créditos Insuficientes.`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {(alertBuyPoints.message ?? `Você não possui créditos suficientes para realizar esta ação. Deseja comprar créditos?`).split('\n').map((item, i) => (
              <div key={`${i+1}`}>
                  <span>{item}</span>
                  <br />
              </div>
            ))}
            <form onSubmit={handleSubmit(buyPoints)} className="flex flex-col items-center justify-center p-2 gap-3" >
              <span className="font-bold text-sm text-black" >Clique no número para alterar o valor</span>
              <div className="flex gap-2 items-center justify-center" >
                <span className="font-bold text-lg" >Comprar</span>
                <input type="number" inputMode="numeric"  {...register('points')} defaultValue={15} className="w-[70px] p-1 text-center font-bold text-lg" />
                <span className="font-bold text-lg" >reais</span>
              </div>
              {errors.points && <span className="text-sm font-semibold text-red-500" >{errors.points.message}</span>}              

                <button ref={confirmRef} type="submit" disabled={loading} className="text-white rounded shadow p-3 px-5 hidden" style={{backgroundColor:colors.valero()}} >
                  {loading ? `Aguarde...` :`Comprar`}
                </button>

            </form>

            <div className="flex gap-2 items-center justify-center mt-1" >               
                
              <button onClick={() => closeRef.current?.click()} className="bg-red-500 text-white p-3 px-5 flex items-center justify-center rounded" >
                Cancelar
              </button>

              <button onClick={() => confirmRef.current?.click()} disabled={loading} className="text-white rounded shadow p-3 px-5" style={{backgroundColor:colors.valero()}} >
                {loading ? `Aguarde...` :`Comprar`}
              </button>

            </div>

          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>            
          <AlertDialogCancel ref={closeRef} className="bg-red-500 text-white hidden" >Cancelar</AlertDialogCancel>
          {/* <AlertDialogAction>Entendi</AlertDialogAction> */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
  