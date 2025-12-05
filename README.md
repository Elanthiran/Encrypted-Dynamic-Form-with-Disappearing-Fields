# Encrypted-Dynamic-Form-with-Disappearing-Fields


1. How encryption and decryption were handled (simple explanation)

Encryption was done using AES-256-CBC.

Before encrypting, the text was prefixed with "SALT1234".

The encryption key was created by taking a SHA-256  "internsNeverGuess".

The backend encrypted each field and sent the encrypted text + IV to the frontend.

The frontend used the same key and IV to decrypt the field back to normal text.

2. Method used to detect the decoy field (simple explanation)

After decrypting each field:

The code checked whether the decrypted text starts with "SALT1234".

Only the field that contains this valid salt was accepted.

If the decrypted text does not start with "SALT1234", it was identified as the decoy and ignored.
