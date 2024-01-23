import './App.css';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { GearFill } from 'react-bootstrap-icons';

import PageButton from './components/PageButton';
import ConnectButton from './components/ConnectButton';
import ConfigModal from './components/ConfigModal';
import CurrencyField from './components/CurrencyField';

import BeatLoader from "react-spinners/BeatLoader";
import { getPillarXContract, getPillarYContract, getPrice, runSwap } from './AlphaRouterService'

function App() {
  const [provider, setProvider] = useState(undefined)
  const [signer, setSigner] = useState(undefined)
  const [signerAddress, setSignerAddress] = useState(undefined)

  const [slippageAmount, setSlippageAmount] = useState(2)
  const [deadlineMinutes, setDeadlineMinutes] = useState(10)
  const [showModal, setShowModal] = useState(undefined)

  const [inputAmount, setInputAmount] = useState(undefined)
  const [outputAmount, setOutputAmount] = useState(undefined)
  const [transaction, setTransaction] = useState(undefined)
  const [loading, setLoading] = useState(undefined)
  const [ratio, setRatio] = useState(undefined)
  const [pillarXContract, setPillarXContract] = useState(undefined)
  const [pillarYContract, setPillarYContract] = useState(undefined)
  const [pillarXAmount, setPillarXAmount] = useState(undefined)
  const [pillarYAmount, setPillarYAmount] = useState(undefined)

  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const pillarXContract = getPillarXContract()
      setPillarXContract(pillarXContract)

      const pillarYContract = getPillarYContract()
      setPillarYContract(pillarYContract)
    }
    onLoad()
  }, [])

  const getSigner = async provider => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setSigner(signer)
  }
  const isConnected = () => signer !== undefined
  const getWalletAddress = () => {
    signer.getAddress()
      .then(address => {
        setSignerAddress(address)

        pillarXContract.balanceOf(address)
          .then(res => {
            setPillarXAmount( Number(ethers.utils.formatEther(res)) )
          })
        pillarYContract.balanceOf(address)
          .then(res => {
            setPillarYAmount( Number(ethers.utils.formatEther(res)) )
          })

      })
  }

  if (signer !== undefined) {
    getWalletAddress()
  }

  const getSwapPrice = (inputAmount) => {
    setLoading(true)
    setInputAmount(inputAmount)

    const swap = getPrice(
      inputAmount,
      slippageAmount,
      Math.floor(Date.now()/1000 + (deadlineMinutes * 60)),
      signerAddress
    ).then(data => {
      setTransaction(data[0])
      setOutputAmount(data[1])
      setRatio(data[2])
      setLoading(false)
    })
  }


  return (
    <div className="App">
      <div className="appNav">
        <div className="my-2 buttonContainer buttonContainerTop">
          {/* TODO build mint buttons   */}
          <PageButton name={"Mint 100 PillarX"} link={"https://google.com"} isBold={true} />
          <PageButton name={"Mint 100 PillarY"} link={"https://twitter.com"} isBold={true} />
          <PageButton name={"Goerli Faucet"} link={"https://goerlifaucet.com/"} isBold={true} />
        </div>

        <div className="rightNav">
          <div className="connectButtonContainer">
            <ConnectButton
              provider={provider}
              isConnected={isConnected}
              signerAddress={signerAddress}
              getSigner={getSigner}
            />
          </div>
          <div className="my-2 buttonContainer">
            <PageButton name={"..."} isBold={true} />
          </div>
        </div>
      </div>

      <div className="appBody">
        <div className="swapContainer">
          <div className="swapHeader">
            <span className="swapText">Swap</span>
            <span className="gearContainer" onClick={() => setShowModal(true)}>
              <GearFill />
            </span>
            {showModal && (
              <ConfigModal
                onClose={() => setShowModal(false)}
                setDeadlineMinutes={setDeadlineMinutes}
                deadlineMinutes={deadlineMinutes}
                setSlippageAmount={setSlippageAmount}
                slippageAmount={slippageAmount} />
            )}
          </div>

          <div className="swapBody">
            <CurrencyField
              field="input"
              tokenName="PillarX"
              getSwapPrice={getSwapPrice}
              signer={signer}
              balance={pillarXAmount} />
            <CurrencyField
              field="output"
              tokenName="PillarY"
              value={outputAmount}
              signer={signer}
              balance={pillarYAmount}
              spinner={BeatLoader}
              loading={loading} />
          </div>

          <div className="ratioContainer">
            {ratio && (
              <>
                {`1 PX = ${ratio} PY`}
              </>
            )}
          </div>

          <div className="swapButtonContainer">
            {isConnected() ? (
              <div
                onClick={() => runSwap(transaction, signer)}
                className="swapButton"
              >
                Swap
              </div>
            ) : (
              <div
                onClick={() => getSigner(provider)}
                className="swapButton"
              >
                Connect Wallet
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

export default App