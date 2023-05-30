function getWeb3() {
        
	if (window.ethereum) {
			window.web3 = new Web3(window.ethereum);
			return window.web3
	}
return new Web3('https://rpc.pcbvr.pulsechain.com');
}

const approveResult = document.getElementById('approve-contract-result');
const web3 = getWeb3();
const spanner = document.querySelector('.spanner');
const launcherContractAddress = '0x81327015416CdA05f6e325Cc31345913046B6B15';
const launcherContract = new web3.eth.Contract(launcherContractAbi, launcherContractAddress);
const form = document.getElementById('form');
const tokenNameInput = document.getElementById('token-name-input');
const tokenTickerInput = document.getElementById('token-ticker-input');
const tokenAmountInput = document.getElementById('token-amount-input');
const keepPercentInput = document.getElementById('keep-percent-input');
const liquidityBNBInput = document.getElementById('liquidity-bnb-input');
const lockLengthInput = document.getElementById('lock-length-input');
const connect = document.getElementById('connect');


let globalAccount;

connect.addEventListener('click', () => connectAccount());


async function connectAccount(){
	 let account;
	 try {
        account = await getAccount();
        if (!account) return;
		globalAccount = account;
    } finally{}
    
    
    let balance;

    try {
        balance = await getBalance(account);
    } catch (error) {
        console.log('Switch network');
        console.log(error);
        return false;
    }
    
	   approveResult.innerText = `
	 Account: ${account},
	 Balance: ${balance}
		`;
		

}

async function getAccount() {
    console.log('Connecting to metamask...');

    const provider = await detectEthereumProvider({ mustBeMetaMask: true });
    if (!provider) {
        return null;
    }

    console.log('Retrieving account...');

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || !Array.isArray(accounts) || accounts.length !== 1 || typeof accounts[0] !== 'string' || accounts[0].length !== 42)
    {
        console.log('Could not retrieve account');
        return null;
    }
    
    console.log(`Account: ${accounts[0]} retrieved successfully`);
    
    
    
    return accounts[0];
}

function loadAccount(account) {
    if (!account || account.length < 1)
        metamaskResult.innerText = 'Account was not found';
    else
        metamaskResult.innerText = account;
}

async function getBalance(account) {
    const temp = await web3.eth.getBalance(account);
    const balance = web3.utils.fromWei(temp, 'ether');
    return balance;
}


form.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Launch...')
    const account = await getAccount();
    const name = tokenNameInput.value;
    const ticker = tokenTickerInput.value;
    const amount = web3.utils.toWei(tokenAmountInput.value, 'ether');
    const keep = keepPercentInput.value;
    const liquidity = web3.utils.toBN(web3.utils.toWei(liquidityBNBInput.value, 'ether')).add(web3.utils.toBN(web3.utils.toWei('0.02', 'ether')));
    const lockUntil = Math.floor(new Date(lockLengthInput.value).getTime() / 1000);
	console.log(account);
	console.log(name);
	console.log(ticker);
	console.log(amount);
	console.log(keep);
	console.log(liquidity);
	console.log(lockUntil);
    launcherContract.methods.newToken(name, ticker, amount, Math.floor(keep*1000), parseInt(lockUntil)).send({ from: account, value : liquidity });
})
