import { Horizon } from 'stellar-sdk';
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

server.payments()
  .limit(5)
  .order("desc")
  .call()
  .then(function(page) {
    if (page.records.length > 0) {
      console.log("Types:", page.records.map(r => r.type));
      console.log("First record:", JSON.stringify(page.records[0], null, 2));
    } else {
      console.log("No records found in latest");
    }
  })
  .catch(function(err) {
    console.error(err);
  });
