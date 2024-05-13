import { UsersUser } from "@/src/config/firebase/firebaseFunctions/functions/src/config/firebase-admin/collectionTypes/users";
import UserManagement from "@/src/modules/projectExclusive/UserManagement";
import UserFinancialData from "@/src/modules/projectExclusive/UserManagement/UserFinancialData";
import { NextResponse } from "next/server";



export async function POST(req:Request) {

    try {
        const { userData, hashedPmId } = await req.json() as { userData: Omit<UsersUser, "control">, hashedPmId:string  };
        if (!userData) throw new Error("usuário inválido");        
        const userMan = new UserManagement();
        const fd = new UserFinancialData();
        const { pms , stripeId} = await userMan.getPaymentMethods({ uid:userData.uid, userData });
        const pm = userMan.filterPaymentMethodByHashedId(hashedPmId, pms);
        
        // verifica se há mais de um método de pagamento, se houver, torna outro dos métodos como o cartão principal
        const cus = await fd.stripe.stripe.customers.retrieve(stripeId);
        if (pm && !cus.deleted) {
            if (cus.metadata.defaultPm === pm.id && pms.data.length > 1) {
                const newPm = pms.data.filter(item => item.id !== pm.id)[0];
                await fd.setUserDefaultPaymentMethod({ stripeId, paymentMethod:newPm });
            }
            await fd.stripe.stripe.paymentMethods.detach(pm.id);
        }
    //    const { frontEnd } = await userMan.getPaymentMethodsToFrontEnd({ uid:userData.uid, userData })
        
        return NextResponse.json({data:true});
    } catch (e:any) {
        return NextResponse.json({error:`Houver um erro: ${e.message}`});
    }
    
};