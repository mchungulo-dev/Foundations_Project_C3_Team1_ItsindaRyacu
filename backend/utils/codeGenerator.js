const crypto = require('crypto');

const generateInviteCode = () => {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.randomBytes(8);
    let code = '';
    
    for(let i = 0; i < 8; i++){
        code += charset[bytes[i] % charset.length];
    }

    console.log(code);
};

generateInviteCode();

module.exports = { generateInviteCode };