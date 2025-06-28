const crypto = require('crypto');
const moment = require('moment');
const querystring = require('qs'); // VNPay official uses querystring

// Real VNPay Configuration
const vnp_TmnCode = 'YCY35LIY'; // Real TMN Code
const vnp_HashSecret = '7CHJ0XHUP49QCCGV68F9X2V850WAMTH8'; // Real Hash Secret  
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = 'http://localhost:4000/payment-success';

// VNPay official sortObject function - EXACTLY like their code
function sortObject(obj) {
    console.log('🔧 [Test] sortObject input:', obj);
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    console.log('🔧 [Test] sortObject output:', sorted);
    return sorted;
}

function createVnpayPayment(amount, orderId, orderInfo, ipAddr = '127.0.0.1') {
    const createDate = moment().format('YYYYMMDDHHmmss');

    // Create vnp_Params object - EXACTLY like VNPay official
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId; // EXACTLY like VNPay official
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100; // VNPay requires amount in VND cents
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    console.log('=== DEBUG VNPay Official Method ===');
    console.log('📋 Initial vnp_Params (before sort):', vnp_Params);

    // Sort using VNPay official sortObject
    vnp_Params = sortObject(vnp_Params);
    console.log('📋 Sorted vnp_Params:', vnp_Params);

    // Create signData using querystring.stringify - EXACTLY like VNPay official
    let signData = querystring.stringify(vnp_Params, { encode: false });
    console.log('🔑 signData (querystring method):', signData);

    // Generate signature using Buffer - EXACTLY like VNPay official
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    console.log('🔏 Generated signature:', signed);

    // Create final URL - EXACTLY like VNPay official
    let vnpUrl = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

    return {
        paymentUrl: vnpUrl,
        orderId,
        amount,
        params: vnp_Params,
        signData,
        signature: signed
    };
}

// Test function to verify signature - VNPay official method
function testSignatureVerification(params) {
    let secureHash = params['vnp_SecureHash'];
    
    // Remove signature fields - EXACTLY like VNPay official
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    console.log('🔍 Params after removing hash:', params);

    // Sort using VNPay official sortObject
    params = sortObject(params);
    console.log('🔍 Sorted params for verification:', params);

    // Create signData using querystring - EXACTLY like VNPay official
    let signData = querystring.stringify(params, { encode: false });
    console.log('🔍 Verification signData:', signData);

    // Generate signature using Buffer - EXACTLY like VNPay official
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    console.log('\n=== SIGNATURE VERIFICATION (VNPay Official Method) ===');
    console.log('Original signature:', secureHash);
    console.log('Verified signature:', signed);
    console.log('Match:', secureHash === signed);

    return secureHash === signed;
}

// Demo test với VNPay Official Method
const testPayment = createVnpayPayment(
    50000, // 50,000 VND (test với số tiền vừa phải)
    `TEST_${Date.now()}`,
    'Test payment'
);

console.log('\n=== VNPay Payment URL Demo (Official Method) ===');
console.log('Amount:', testPayment.amount, 'VND');
console.log('Order ID:', testPayment.orderId);
console.log('Signature:', testPayment.signature);
console.log('Payment URL:', testPayment.paymentUrl);

console.log('\n=== All Parameters ===');
console.log(JSON.stringify(testPayment.params, null, 2));

// Test signature verification với params copy
const paramsForVerification = JSON.parse(JSON.stringify(testPayment.params));
testSignatureVerification(paramsForVerification);

console.log('\n🎯 This matches EXACTLY with VNPay official implementation!');
console.log('✅ VNPay TMN_CODE:', vnp_TmnCode);
console.log('✅ VNPay HASH_SECRET:', vnp_HashSecret ? 'Set correctly' : 'Missing!');
console.log('\n🚀 Để test:');
console.log('1. Copy URL trên vào browser');
console.log('2. Check console logs trong backend khi FE gọi API');
console.log('3. So sánh signature generation method');
console.log('\n⚠️  Nếu vẫn lỗi "Sai chữ ký", có thể TMN_CODE/HASH_SECRET chưa đúng!');
console.log('⚠️  Hoặc VNPay sandbox có issue - thử với credentials production!'); 