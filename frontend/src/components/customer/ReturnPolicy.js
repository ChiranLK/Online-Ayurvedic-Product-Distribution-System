import React from 'react';
import { Link } from 'react-router-dom';

const ReturnPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Return Policy</h1>
        <p className="text-gray-600">
          Our return policy is designed to ensure your complete satisfaction with your purchase.
          Please read carefully to understand our policies regarding returns, exchanges, and refunds.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Return Eligibility</h2>
        <div className="space-y-4">
          <div className="flex">
            <div className="mr-4 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">14-Day Return Window</h3>
              <p className="text-gray-600">
                You may return your order within 14 days from the date of delivery for a full refund or exchange.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Unopened Products</h3>
              <p className="text-gray-600">
                Products must be unused, unopened, and in their original packaging with all seals intact.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Proof of Purchase</h3>
              <p className="text-gray-600">
                A receipt or order confirmation email must be provided as proof of purchase.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Items Not Eligible for Return</h2>
        <div className="space-y-4">
          <div className="flex">
            <div className="mr-4 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Opened Products</h3>
              <p className="text-gray-600">
                Products that have been opened, used, or have damaged packaging cannot be returned for hygiene and safety reasons.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Personalized Products</h3>
              <p className="text-gray-600">
                Custom or personalized items are not eligible for return unless they are defective.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Sale Items</h3>
              <p className="text-gray-600">
                Products purchased during special sales or promotions (marked as "Final Sale") may not be eligible for return.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Perishable Items</h3>
              <p className="text-gray-600">
                Perishable or consumable goods like fresh herbs cannot be returned once delivered unless they arrive damaged or spoiled.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Return Process</h2>
        <ol className="space-y-6">
          <li className="flex">
            <div className="bg-green-100 rounded-full h-8 w-8 flex items-center justify-center text-green-600 font-semibold mr-4 flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Initiate Return Request</h3>
              <p className="text-gray-600">
                Log in to your account, go to your order history, select the order containing the item you wish to return, and follow the return instructions.
                Alternatively, you can email our customer support at returns@ayurveda.lk with your order number and details.
              </p>
            </div>
          </li>
          
          <li className="flex">
            <div className="bg-green-100 rounded-full h-8 w-8 flex items-center justify-center text-green-600 font-semibold mr-4 flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Packaging the Return</h3>
              <p className="text-gray-600">
                Pack the item securely in its original packaging or a suitable alternative to prevent damage during transit.
                Include your order number and return form (if provided) inside the package.
              </p>
            </div>
          </li>
          
          <li className="flex">
            <div className="bg-green-100 rounded-full h-8 w-8 flex items-center justify-center text-green-600 font-semibold mr-4 flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Shipping the Return</h3>
              <p className="text-gray-600">
                For local customers: You can drop off the return at our store in Colombo or use any courier service of your choice.<br />
                For international customers: Please use a trackable shipping method and keep the tracking information until your return is processed.
              </p>
            </div>
          </li>
          
          <li className="flex">
            <div className="bg-green-100 rounded-full h-8 w-8 flex items-center justify-center text-green-600 font-semibold mr-4 flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Refund or Exchange Processing</h3>
              <p className="text-gray-600">
                Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund or exchange.
                If approved, refunds will be processed within 3-5 business days to your original payment method.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Refund Information</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">Refund Method</h3>
            <p className="text-gray-600">
              Refunds will be issued to the original payment method used for the purchase. For credit/debit card payments, 
              please allow 5-10 business days for the refund to appear in your account statement.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700">Refund Amount</h3>
            <p className="text-gray-600">
              You will receive a refund for the full amount of the product price. Shipping charges are non-refundable unless 
              the return is due to our error (damaged product, wrong item sent, etc.).
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700">Return Shipping Costs</h3>
            <p className="text-gray-600">
              Customers are responsible for return shipping costs unless the return is due to our error.
              For defective products or incorrectly shipped items, we will provide a prepaid shipping label or reimburse the return shipping cost.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Exchanges</h2>
        <p className="text-gray-600 mb-4">
          We offer exchanges for products of equal value. If you wish to exchange for a product of higher value, 
          you will need to pay the difference. For products of lower value, we will refund the difference.
        </p>
        <p className="text-gray-600">
          To request an exchange, follow the same process as returns but specify that you want an exchange 
          instead of a refund and indicate the replacement item you would like.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Damaged or Defective Items</h2>
        <p className="text-gray-600 mb-4">
          If you receive a damaged or defective product, please contact us within 48 hours of delivery.
          Include photos of the damaged product and packaging to expedite the process.
        </p>
        <p className="text-gray-600">
          We will arrange for a replacement or refund as soon as possible. In such cases, 
          we will cover the return shipping costs and send a prepaid shipping label if necessary.
        </p>
      </div>

      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h2 className="text-xl font-semibold text-green-800 mb-2">Need Help?</h2>
        <p className="text-green-700 mb-4">
          If you have any questions or need assistance with returns, our customer support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/customer/support"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center"
          >
            Contact Support
          </Link>
          <Link
            to="/faqs"
            className="inline-block px-6 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 text-center"
          >
            View FAQs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
