// Inventory Check Function
// Checks product availability from your inventory database

exports.handler = async (event, context) => {
  try {
    const { productId, quantity } = JSON.parse(event.body || '{}');

    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Product ID required' })
      };
    }

    const fetch = require('node-fetch');

    // Check inventory from Airtable
    if (process.env.AIRTABLE_API_KEY) {
      const response = await fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Inventory?filterByFormula={SKU}='${productId}'`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check inventory');
      }

      const data = await response.json();

      if (data.records.length === 0) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            available: false,
            message: 'Product not found'
          })
        };
      }

      const product = data.records[0].fields;
      const stockLevel = product.Stock || 0;
      const requestedQty = quantity || 1;

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          available: stockLevel >= requestedQty,
          stock: stockLevel,
          sku: productId,
          message: stockLevel >= requestedQty
            ? 'Product available'
            : stockLevel > 0
              ? `Only ${stockLevel} units available`
              : 'Out of stock'
        })
      };
    }

    // If no inventory system configured, assume always available
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        available: true,
        message: 'Product available',
        note: 'Inventory checking not configured'
      })
    };

  } catch (error) {
    console.error('Inventory check error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to check inventory',
        details: error.message
      })
    };
  }
};
