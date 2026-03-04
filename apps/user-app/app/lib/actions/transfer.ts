"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import { create } from "domain";

async function createOnRampTransaction(amount: number, provider: string, userId: number) {
    const token = Math.random().toString(); // const token = await axios.get("https://api.hdfc.fjksjdflkajlsdkfjalsjdflajsdf") 
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

export async function transfer(to: string, amount: number, provider: string) {
  const session = await getServerSession(authOptions);
  const from = session.user.id;
  if (!from) {
    return {
      message: "Error while sending",
    };
  }

  const toUser = await prisma.user.findFirst({
    where: {
      number: to,
    },
  });

  if (!toUser) {
    return {
      message: "User not found",
    };
  }

  await prisma.$transaction(async (tx) => {
    const fromBalance = await tx.balance.findUnique({
      where: {
        userId: Number(from),
      },
    });

    if (!fromBalance || fromBalance.amount < amount) {
      throw new Error("Insufficient Balance");
    }

    await tx.balance.update({
      where: {
        userId: Number(from),
      },
      data: {
        amount: {
          decrement: amount,
        },
      },
    });

    await tx.balance.update({
      where: {
        userId: Number(toUser.id),
      },
      data: {
        amount: {
          increment: amount,
        },
      },
    });
  });

  createOnRampTransaction(amount, provider, toUser.id);
  createOnRampTransaction(-1 * amount, provider, from);
}
