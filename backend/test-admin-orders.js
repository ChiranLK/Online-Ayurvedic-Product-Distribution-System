// Test script for admin orders endpoint
const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@ayurveda.com'; // Replace with valid admin email
const ADMIN_PASSWORD = 'password123';      // Replace with valid admin password

// Utility functions
function logHeader(title) {
    console.log('\n' + '='.repeat(50));
    console.log(` 🔍 ${title}`);
    console.log('='.repeat(50));
}

function logSuccess(message) {
    console.log(`✅ ${message}`);
}

function logError(message, error) {
    console.error(`❌ ${message}`);
    if (error) {
        console.error('   Error details:', error);
    }
}

function logJson(label, data) {
    console.log(`📄 ${label}:`);
    console.log(JSON.stringify(data, null, 2));
}

async function testAdminOrdersEndpoint() {
    try {
        logHeader('Testing Admin Orders API');
        
        // Step 1: Authenticate
        console.log('🔑 Authenticating as admin...');
        const authResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });

        const authData = await authResponse.json();
        
        if (!authData.token) {
            logError('Authentication failed', authData.message || 'No token received');
            return;
        }
        
        logSuccess('Authentication successful');
        const token = authData.token;

        // Step 2: Test GET /api/admin/orders
        logHeader('Testing GET /api/admin/orders');
        
        const ordersResponse = await fetch(`${API_URL}/api/admin/orders`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Check if response is OK
        if (!ordersResponse.ok) {
            const errorData = await ordersResponse.text();
            logError(`Failed with status ${ordersResponse.status}`, errorData);
            
            // If it's a server error, print Order model for debugging
            if (ordersResponse.status >= 500) {
                console.log('\n🔍 Debugging help:');
                console.log('1. Check that Order model fields match the queries in adminOrderRoutes.js');
                console.log('2. Verify that middleware/authorize.js is working correctly');
                console.log('3. Look for any MongoDB connection issues');
            }
            return;
        }

        const ordersData = await ordersResponse.json();
        
        logSuccess(`Response status: ${ordersResponse.status}`);
        logSuccess(`Success: ${ordersData.success}`);
        logSuccess(`Total orders: ${ordersData.count || 'N/A'}`);
        
        if (ordersData.orders && ordersData.orders.length > 0) {
            console.log('\n📦 First order sample:');
            const sampleOrder = ordersData.orders[0];
            
            // Print important fields only
            const orderSummary = {
                _id: sampleOrder._id,
                customerId: sampleOrder.customerId,
                status: sampleOrder.status,
                totalAmount: sampleOrder.totalAmount,
                itemsCount: sampleOrder.items?.length,
                orderDate: sampleOrder.orderDate,
                paymentMethod: sampleOrder.paymentMethod
            };
            
            logJson('Order summary', orderSummary);
            
            // Print detailed fields about the first item
            if (sampleOrder.items && sampleOrder.items.length > 0) {
                logJson('First item in order', sampleOrder.items[0]);
            }
        } else {
            console.log('⚠️ No orders found in the database');
        }

        // Step 3: Test GET /api/admin/orders/stats
        logHeader('Testing GET /api/admin/orders/stats');
        
        const statsResponse = await fetch(`${API_URL}/api/admin/orders/stats`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!statsResponse.ok) {
            const errorData = await statsResponse.text();
            logError(`Stats endpoint failed with status ${statsResponse.status}`, errorData);
            return;
        }
        
        const statsData = await statsResponse.json();
        logSuccess(`Stats endpoint response status: ${statsResponse.status}`);
        logJson('Order statistics', statsData);
        
        logHeader('Test Completed Successfully');

    } catch (error) {
        logError('Error testing admin orders endpoint', error);
    }
}

// Run the test
testAdminOrdersEndpoint();
