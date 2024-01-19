const { AlphaRouter } = require('@uniswap/smart-order-router')
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { ethers, BigNumber } = require('ethers')
const JSBI = require('jsbi')
const ERC20ABI = require('./abi.json')

const V3_SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';
const RPC = 'https://polygon-mumbai.gateway.tenderly.co';

const chainId = 80001

const web3Provider = new ethers.providers.JsonRpcProvider(RPC)
const router = new AlphaRouter({ chainId: chainId, provider: web3Provider})


const name0 = 'PillarX'
const symbol0 = 'PX'
const decimals0 = 18
const address0 = '0x977d6727930342951475319d78b49F6a80398A8F'

const name1 = 'PillarY'
const symbol1 = 'PY'
const decimals1 = 18
const address1 = '0x121428E1316c1bfb8Ec6592C0668381a2BA21270'

const PX = new Token(chainId, address0, decimals0, symbol0, name0)
const PY = new Token(chainId, address1, decimals1, symbol1, name1)

export const getPillarXContract = () => new ethers.Contract(address0, ERC20ABI, web3Provider)
export const getPillarYContract = () => new ethers.Contract(address1, ERC20ABI, web3Provider)

export const getPrice = async (inputAmount, slippageAmount, deadline, walletAddress) => {
    const percentSlippage = new Percent(slippageAmount, 100)
    const wei = ethers.utils.parseUnits((inputAmount.toString()), decimals0)
    const currencyAmount = CurrencyAmount.fromRawAmount(PX, JSBI.BigInt(wei))

    const route = await router.route(
        currencyAmount,
        PY,
        TradeType.EXACT_INPUT,
        {
            recipient: "0x26fA48f0407DBa513d7AD474e95760794e5D698E",
            slippageTolerance: percentSlippage,
            deadline: deadline,
        }
    )

    const transaction = {
        data: route.methodParameters.calldata,
        to: V3_SWAP_ROUTER_ADDRESS,
        value: BigNumber.from(route.methodParameters.value),
        from: "0x26fA48f0407DBa513d7AD474e95760794e5D698E",
        gasPrice: BigNumber.from(route.gasPriceWei),
        gasLimit:  ethers.utils.hexlify(1000000)
    }

    const quoteAmountOut = route.quote.toFixed(6)
    const ratio = (quoteAmountOut / inputAmount).toFixed(3)

    return [
        transaction, quoteAmountOut, ratio
    ]
}


export const runSwap = async (transaction, signer) => {
    const approvalAmount = ethers.utils.parseUnits('10', 18).toString()
    const contract0 = getPillarXContract();
    await contract0.connect(signer).approve(
        V3_SWAP_ROUTER_ADDRESS,
        approvalAmount
    )

    signer.sendTransaction(transaction)
}