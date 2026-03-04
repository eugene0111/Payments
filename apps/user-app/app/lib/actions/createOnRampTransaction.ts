"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client"

export async function createOnRampTransaction(amount: number, provider: string) {
    const session = await getServerSession(authOptions);   
    const token = Math.random().toString(); // const token = await axios.get("https://api.hdfc.fjksjdflkajlsdkfjalsjdflajsdf") 
    const userId = session.user.id;
    if (!userId) {
        return {
            message: "User not logged in"
        }
    }
    await prisma.onRampTransaction.create({
        // @ts-ignore
        data: {
            userId: Number(userId),
            amount: amount * 100,
            startTime: new Date(),
            provider: provider,
            token,
            status: "Processing"
        }
    })
    return {
        message: "On ramp transaction created"
    }
}
