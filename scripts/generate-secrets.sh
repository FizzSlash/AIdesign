#!/bin/bash

# Generate secure secrets for .env file

echo "🔐 Generating Secure Secrets for AI Email Designer"
echo "=================================================="
echo ""

# Check for OpenSSL
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL is required but not installed."
    exit 1
fi

# Generate JWT Secret (32 bytes, base64 encoded)
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET (copy to .env):"
echo "$JWT_SECRET"
echo ""

# Generate Encryption Key (exactly 32 characters for AES-256)
ENCRYPTION_KEY=$(openssl rand -hex 16)
echo "ENCRYPTION_KEY (copy to .env):"
echo "$ENCRYPTION_KEY"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    
    # Update the secrets in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-secure-32-character-secret-here/$JWT_SECRET/" .env
        sed -i '' "s/your-encryption-key-32-chars!!/$ENCRYPTION_KEY/" .env
    else
        # Linux
        sed -i "s/your-secure-32-character-secret-here/$JWT_SECRET/" .env
        sed -i "s/your-encryption-key-32-chars!!/$ENCRYPTION_KEY/" .env
    fi
    
    echo "✅ .env file created with secure secrets!"
    echo ""
    echo "⚠️  Don't forget to add your API keys:"
    echo "   - OPENAI_API_KEY"
    echo "   - AWS credentials (for S3)"
    echo ""
else
    echo "⚠️  .env file already exists. Secrets not automatically applied."
    echo "   Please copy the values above manually if needed."
    echo ""
fi

