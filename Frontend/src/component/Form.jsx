import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import "../App.css";

const SALT = "SALT1234";
const knownKey = "internsNeverGuess";


function makeKey(pass) {
  const hash = CryptoJS.SHA256(pass).toString(CryptoJS.enc.Hex);
  return CryptoJS.enc.Hex.parse(hash);
}

const allowedTypes = ["text", "email", "number", "password"];

export default function Form() {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]); // decrypted fields
  const [step, setStep] = useState(0); // which input we are showing
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const inputRef = useRef(null);

  
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [step]);

  useEffect(() => {
    async function loadFields() {
      try {
        const res = await axios.get("http://localhost:3000/api/form");
        const encrypted = res.data.fields;

        const keyWords = makeKey(knownKey);

        const finalFields = [];

        for (const f of encrypted) {
          try {
            
            const cipherText = CryptoJS.enc.Base64.parse(f.data);
            const ivWords = CryptoJS.enc.Base64.parse(f.iv);

            const cipherParams = CryptoJS.lib.CipherParams.create({
              ciphertext: cipherText,
            });

            // Decrypt
            const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWords, {
              iv: ivWords,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7,
            });

            const plain = decrypted.toString(CryptoJS.enc.Utf8);
            if (!plain) continue;

            
            if (!plain.startsWith(SALT)) continue;

            
            const real = plain.slice(SALT.length);
   
            // ["Full Name", "text"]
            const match = real.split(":"); 

            if (match.length !== 2) continue;

            const label = match[1] ? match[0].trim() : null;
            const type = match[1] ? match[1].trim().toLowerCase() : null;

            if (!allowedTypes.includes(type)) continue;

            finalFields.push({ label, type });
          } catch (err) {}
        }

        setFields(finalFields);
      } catch (err) {
        console.error("Error loading fields", err);
      } finally {
        setLoading(false);
      }
    }

    loadFields();
  },[]);

  if (loading) return <h3>Loading form…</h3>;
  if (fields.length === 0) return <h3>No valid fields found.</h3>;

  
  const current = fields[step];

  
  function handleBlur(e) {
    const value = e.target.value;

    
    setValues((prev) => ({ ...prev, [current.label]: value }));

    const nextStep = step + 1;

    if (nextStep < fields.length) {
      setStep(nextStep);
    } else {
      submit({ ...values, [current.label]: value });
    }
  }

  
  function handleKey(e) {
    if (e.key === "Enter") {
      e.target.blur();
    }
  }

  
  async function submit(data) {
    try {
      const res = await axios.post("http://localhost:3000/api/submit", data);
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error", err);
    }
  }

  
  if (submitted) {
    return (
      <div>
        <h2>Form Submitted Successfully </h2>
        <pre style={{ background: "#eee", padding: 10 }}>
          {JSON.stringify(values, null, 2)}
        </pre>
      </div>
    );
  }

  
  return (
    <div  >
      <p>Fill the field and click outside to continue.</p>

      <label style={{ fontWeight: "bold" }}>{current.label}</label>

      <input className="inputs"
        ref={inputRef}
        type={current.type}
        placeholder={current.label}
        onBlur={handleBlur}
        onKeyDown={handleKey}
        style={{
          width: "100%",
          padding: 10,
          marginTop: 6,
          borderRadius: 6,
          border: "1px solid #aaa",
          fontSize: 16,
        }}
      />

      <div style={{ marginTop: 10 }}>
        Field {step + 1} of {fields.length}
      </div>
    </div>
  );
}
