Required programs
For export, import of firestore:  
https://www.npmjs.com/package/node-firestore-import-export  
for export and import of users  
Firebase CLI:  
https://firebase.google.com/docs/cli  
for export, import of cloud storage (Images):  
https://cloud.google.com/storage/docs/gsutil  

# Exporting Firestore

## Retrieving Google Cloud Account Credentials for PWASBU   

Visit the Firebase Console: 
Select your project (PWASBU)  
Navigate to Project Settings (at the time of writing the gear icon button at the top left of the page).  
Navigate to Service Accounts  
Click Generate New Private Key  

This will give you a file, which I will rename to "pwasbu-firebase-creds.json" for the following instructions  
from the terminal or "cmd" in windows  
change the directory to the location of "pwasbu-firebase-creds.json"" and type:  
firestore-export --accountCredentials .\pwasbu-firebase-creds.json --backupFile pwasbu_backup.json  
The backup will be in "pwasbu_backup.json"  

## Retrieving Google Cloud Account Credentials for "Camp Abilities" firebase project  

Visit the Firebase Console  
Select your project (Camp Abilities)  
Navigate to Project Settings (at the time of writing the gear icon button at the top left of the page).  
Navigate to Service Accounts  
Click Generate New Private Key  

This will give you a file, which I will call "campAbilities-firebase-creds.json" for the following instructions

# Importing Firestore

Clear the existing data from "Camp Abilities":  
firestore-clear --accountCredentials ./campAbilities-firebase-creds.json --yes  
Import the pwasbu data:  
firestore-import --accountCredentials .\campAbilities-firebase-creds.json --backupFile .\pwasbu_backup.json  

# Exporting users:  
firebase login  
Make sure you have pwasbu as your current firebase project:  
firebase use pwasbu  

Type:  
firebase auth:export pwasbu_users.csv  

In order to have the passwords import properly, you need to get the hash from pwasbu   
Go to the "Authenication" section of the firebase pwasbu project and click the three vertical dots to the right of
"Add user" it should say "Password hash parameters"  
Copy the string for "base64_signer_key" (make sure to skip the trailing comma)  
Cooy the string for "base64_salt_separator" (make sure to skip the trailing comma)  

# Importing users:

Make sure you have "facultycommonskiosk" (Camp Abilities) as your current firebase project:  
firebase use facultycommonskiosk  
You can see a list of projects you have access to   
firebase projects:list  
MAKE SURE IT SHOWS "facultycommonskiosk (current)"   
firebase auth:import .\pwasbu_users.csv --hash-algo=scrypt --rounds=8 --mem-cost=14 --hash-key=&lt;key from above&gt; --salt-separator=&lt;salt from above&gt; 


# Exporting images (buckets):
Make a local "users" directory a s destination for the image:  
mkdir users  
Copy the users bucket from pwasbu:  
cp -r gs://pwasbu.appspot.com/users/* users  

# Importing images:
Copy the local "users" directory to the "Camp Abilities" users bucket  
gsutil cp -r users/* gs://facultycommonskiosk.appspot.com/users/  





