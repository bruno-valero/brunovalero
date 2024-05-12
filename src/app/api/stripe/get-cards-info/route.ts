import { UsersUser } from "@/src/config/firebase/firebaseFunctions/functions/src/config/firebase-admin/collectionTypes/users";
import UserManagement from "@/src/modules/projectExclusive/UserManagement";
import { NextResponse } from "next/server";



export async function POST(req:Request) {

    try {
        const { userData } = await req.json() as { userData: Omit<UsersUser, "control">  };
        if (!userData) throw new Error("usuário inválido");        
        const userMan = new UserManagement();
        
       const { frontEnd } = await userMan.getPaymentMethodsToFrontEnd({ uid:userData.uid, userData });
    //    alert(JSON.stringify(frontEnd, null, 2))
        return NextResponse.json({data:frontEnd});
    } catch (e:any) {
        return NextResponse.json({error:`Houver um erro: ${e.message}`});
    }
    
};