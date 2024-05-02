import UserManagement from "@/src/modules/projectExclusive/UserManagement";
import UserFinancialData from "@/src/modules/projectExclusive/UserManagement/UserFinancialData";
import UserPrivileges from "@/src/modules/projectExclusive/UserManagement/UserPrivileges";
import { NextResponse } from "next/server";



export async function POST(req:Request) {

    try {
        const { uid } = await req.json() as { uid: string };
        const userManage = new UserManagement()
        const { authUser, userData }  = await userManage.createUser(uid);
        await (new UserPrivileges()).firstLogin(uid);        
        await (new UserFinancialData()).create(uid);        
        return NextResponse.json({data:userData});
    } catch (e:any) {
        return NextResponse.json({error:`Houver um erro: ${e.message}`});
    }
    
};