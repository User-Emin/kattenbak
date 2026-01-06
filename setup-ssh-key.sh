#!/bin/bash

# Script to add SSH public key to server
# Password: Pursangue66@

PUBLIC_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMxiNu+vaxrrn5p5MPhXoYTaORl9BWkmz7yW+smJMlpo github-deploy@catsupply.nl"

echo "════════════════════════════════════════════════════════════════"
echo "🔐 SSH KEY SETUP - FRESH SERVER"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Deze public key moet worden toegevoegd aan de server:"
echo ""
echo "$PUBLIC_KEY"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "INSTRUCTIES:"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1. Open een NIEUWE terminal"
echo "2. Voer uit: ssh root@185.224.139.74"
echo "3. Wachtwoord: Pursangue66@"
echo "4. Op de server, voer uit:"
echo ""
echo "   mkdir -p ~/.ssh && chmod 700 ~/.ssh"
echo "   echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo "   echo 'SSH key toegevoegd!'"
echo "   exit"
echo ""
echo "5. Test verbinding: ssh root@185.224.139.74"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Druk op ENTER als je KLAAR bent met de bovenstaande stappen..."
read

# Test SSH connection
echo "Testing SSH connection..."
ssh -o BatchMode=yes root@185.224.139.74 "echo '✅ SSH KEY WERKT!' && uname -a"

if [ $? -eq 0 ]; then
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "✅ SUCCESS! SSH KEY IS GECONFIGUREERD!"
    echo "════════════════════════════════════════════════════════════════"
else
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "❌ FOUT: SSH KEY NOG NIET WERKEND"
    echo "════════════════════════════════════════════════════════════════"
    echo "Controleer of je alle stappen hebt gevolgd."
fi

