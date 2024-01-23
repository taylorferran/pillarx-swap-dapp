const { AlphaRouter } = require('@uniswap/smart-order-router')
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { ethers, BigNumber } = require('ethers')
const JSBI = require('jsbi')
const ERC20ABI = require('./abi.json')

const V3_SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';
const RPC = 'https://eth-goerli.g.alchemy.com/v2/dYfnm53DsDD80Wmr3foRg5j8Y09i1XRv'

const chainId = 5

const web3Provider = new ethers.providers.JsonRpcProvider(RPC)
const router = new AlphaRouter({ chainId: chainId, provider: web3Provider})

// TODO replace UNI/WETH with PX/PY

const name0 = 'PillarX'
const symbol0 = 'PX'
const decimals0 = 18
const address0 = '0x977d6727930342951475319d78b49F6a80398A8F'

const name1 = 'PillarY'
const symbol1 = 'PY'
const decimals1 = 18
const address1 = '0x121428E1316c1bfb8Ec6592C0668381a2BA21270'

const token0 = {
    chainId: 1,
    decimals: 18,
    symbol: "UNI",
    name: "Uniswap",
    isNative: false,
    isToken: true,
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  };
  
  const token1 = {
    chainId: 1,
    decimals: 18,
    symbol: "WETH",
    name: "Wrapped Ether",
    isNative: false,
    isToken: true,
    address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  };

const PX = new Token(chainId, address0, decimals0, symbol0, name0)
const PY = new Token(chainId, address1, decimals1, symbol1, name1)

const TokenA = new Token(
    chainId,
    token0.address,
    token0.decimals,
    token0.symbol,
    token0.name
  );

  const TokenB = new Token(
    chainId,
    token1.address,
    token1.decimals,
    token1.symbol,
    token1.name
  );

export const getPillarXContract = () => new ethers.Contract(token0.address, ERC20ABI, web3Provider)
export const getPillarYContract = () => new ethers.Contract(token1.address, ERC20ABI, web3Provider)

export const getPrice = async (inputAmount, slippageAmount, deadline, walletAddress) => {
    const percentSlippage = new Percent(slippageAmount, 100)
    const wei = ethers.utils.parseUnits((inputAmount.toString()), 18)
    const currencyAmount = CurrencyAmount.fromRawAmount(TokenA, JSBI.BigInt(wei))

    console.log("XXXX: hit here")

    const route = await router.route(
        currencyAmount,
        TokenB,
        TradeType.EXACT_INPUT,
        {
            recipient: walletAddress,
            slippageTolerance: percentSlippage,
            deadline: deadline,
        }
    )

    console.log("XXXX: hit here2")

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