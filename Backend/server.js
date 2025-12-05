const express = require("express");
const cors = require("cors")
const crypto = require("crypto")


const app =express()
app.use(express.json())

app.use(cors())

const port =3000;

const knownKey="internsNeverGuess"

const key = crypto.createHash("sha256").update(knownKey).digest()

function encryption(form)
{
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
const encrypted = cipher.update("SALT1234" +form , 'utf8', 'base64')
+ cipher.final('base64');
 return {
    data: encrypted,           // base64 ciphertext
    iv: iv.toString('base64')  // base64 iv
  };
}

const formText = [
  "Full Name:text",
  "Email:email",
  "phone:number",
  // Decoy (doesn't follow label:type)
  "??????????___not-valid-base-format",
  "Password:password"
];

app.get("/api/form",(req,res)=>
{
    const encryptedArray = formText.map(item=>{
        return encryption(item)
    })
    res.json({fields:encryptedArray})
})

app.post("/api/submit",(req,res)=>
{
    const payload = req.body;
    res.json({ ok: true, received: payload });
})

app.listen(port,()=>
{
    console.log("Encryption from backend successfully",port)
})

