import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {PrismaAdapter} from '@next-auth/prisma-adapter'
import { compare } from "bcrypt";

import { db } from "./db";

export const authOptions:NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session:{
    strategy: 'jwt'
  },
    pages:{
        signIn: '/sign-in'
    },
    providers: [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "example@mail.com" },
      password: { label: "Password", type: "password" } 
    },
    async authorize(credentials, req) {
      if(credentials?.email || !credentials?.password){
        return null
      }

      const existingUser = await db.user.findUnique({
        where:{email: credentials.email}
      })
      if(!existingUser){
        return null
      }

      const passMatch = await compare(credentials.password, existingUser.password)
      if(!passMatch){
        return null
      }
      return{
        id: `${existingUser.id}`,
        username: existingUser.username,
        email: existingUser.email
      }
    }
  })
]
}