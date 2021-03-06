// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import ecotoken_artifacts from '../../build/contracts/EcoToken.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var EcoToken = contract(ecotoken_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {

  start: function() {
    var self = this;

    // Bootstrap the EcoToken abstraction for Use.
    EcoToken.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      console.log('Account considered is ' + account);

      self.getTotalUsage();
      self.getTokenBalance();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    if(status)status.innerHTML = message;
  },

  getTotalUsage: function() {
      var self = this;

      var meta;
      EcoToken.deployed().then(function(instance) {
        meta = instance;
        return meta.totalUsageData.call(account, {from: account});
      }).then(function(value) {
        var balance_element = document.getElementById("usage");
        if(balance_element)balance_element.innerHTML = value.valueOf();
      }).catch(function(e) {
        console.log(e);
        self.setStatus("Error getting usage; see log.");
      });
    },

  getTokenBalance: function() {
    var self = this;

    var meta;
    EcoToken.deployed().then(function(instance) {
      meta = instance;
      return meta.balanceOf.call(account, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      value = value / (10 ** 18);
      if(balance_element)balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  updateUsage: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    EcoToken.deployed().then(function(instance) {
      meta = instance;
      return meta.updateTotalUsage(amount, {from: account, nonce: 5});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.getTotalUsage();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start();
});
