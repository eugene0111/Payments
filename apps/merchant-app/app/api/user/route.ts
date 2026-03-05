import { NextResponse } from "next/server"
import client from "@repo/db/client";

export const GET = async () => {
    await client.user.create({
        data: {
            email: "asd",
            name: "adsads",
            number: "9091329",
            password: "234234234"
        }
    })
    return NextResponse.json({
        message: "hi there"
    })
}
