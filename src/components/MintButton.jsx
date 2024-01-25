import React from "react"
import { ethers, Contract } from 'ethers';
const PillarXABI = require('../constants/PillarXABI.json')


const mintPillarX = async (signer) => {

    try {
    const pillarXContract = new Contract(
      "0x9e6ce019Cd6e02D905Ee454718F3DF149fe4e5F8",
      PillarXABI,
      signer
    );
    
    const tx = await pillarXContract.mint(ethers.utils.parseUnits("100",18));

    await tx.wait();
    window.alert("100 PillarX minted");
  } catch (err) {
    console.error(err);
  }
  }

const PageButton = props => { 
    return (
        <div  className="btn">
        <div
            onClick={() => mintPillarX(props.signer)}
            >Mint 100 PillarX</div>
        </div>
    )
}

export default PageButton