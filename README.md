# Encrypted-Dynamic-Form-with-Disappearing-Fields


1. Encryption & Decryption 

Data was encrypted using AES-256-CBC with a key made from SHA-256 and "SALT1234" added before encryption. The frontend used the same key + IV to decrypt.

2. Decoy Field Detection 

After decryption, the code checks if the text starts with "SALT1234".
If yes → real field.
If no → decoy field.
