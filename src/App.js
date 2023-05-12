import React, { useEffect, useState } from "react";
import axios from "axios";

const GasPriceCalculator = () => {
  const [selectedChain, setSelectedChain] = useState("MATIC");
  const [selectedCurrency, setSelectedCurrency] = useState("CAD");
  const [prices, setPrices] = useState({});
  const [ethGas, setEthGas] = useState(0);
  const [maticGas, setMaticGas] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network&vs_currencies=cad,usd"
        );
        const data = response.data;
        const prices = {
          ETH: {
            CAD: data.ethereum.cad,
            USD: data.ethereum.usd
          },
          MATIC: {
            CAD: data["matic-network"].cad,
            USD: data["matic-network"].usd
          }
        };
        console.log("prices are: ");
        console.log(prices);

        setPrices(prices);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch gas prices:", error);
      }
    };
    const fetchGasPrice = async () => {
      try {
        const ethResponse = await fetch(
          "https://ethgasstation.info/api/ethgasAPI.json"
        );
        const ethData = await ethResponse.json();
        const ethGasPrice = parseInt(ethData.fast, 10) / 10;
        setEthGas(ethGasPrice);

        const maticResponse = await fetch(
          "https://gasstation-mainnet.matic.network"
        );
        const maticData = await maticResponse.json();
        const maticGasPrice = parseInt(maticData.standard, 10);
        setMaticGas(maticGasPrice);

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch gas price:", error);
      }
    };

    fetchGasPrice();
    fetchPrices();
  }, []);

  useEffect(() => {
    const calculateCost = () => {
      const gasPrice = selectedChain === "ETH" ? ethGas : maticGas;
      const coinPrice = prices[selectedChain]?.[selectedCurrency];
      if (!gasPrice || isNaN(gasPrice) || gasPrice <= 0) {
        console.log("Invalid gas price");
        setEstimatedCost(0);
        return;
      }

      const cost = (coinPrice * gasPrice) / 1e9;
      const gasUsedPerNft = 69000; // Adjust this value based on your NFT contract
      const estCost = (gasUsedPerNft * cost).toFixed(2);
      setEstimatedCost(estCost);
    };

    calculateCost();
  }, [selectedChain, selectedCurrency, ethGas, maticGas, prices]);

  const handleChainChange = (event) => {
    setSelectedChain(event.target.value);
  };

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const renderNFTOptions = () => {
    const options = [100, 250, 500, 1000, 2000];

    return options.map((option) => (
      <tr key={option}>
        <td>{option}</td>
        <td>
          {option * estimatedCost} {selectedCurrency}
        </td>
      </tr>
    ));
  };

  return (
    <div>
      <h2>Gas Price Calculator</h2>
      <div>
        <label htmlFor="chain">Chain:</label>
        <select id="chain" value={selectedChain} onChange={handleChainChange}>
          <option value="ETH">Ethereum</option>
          <option value="MATIC">Polygon</option>
        </select>
      </div>
      <div>
        <label htmlFor="currency">Currency:</label>
        <select
          id="currency"
          value={selectedCurrency}
          onChange={handleCurrencyChange}
        >
          <option value="CAD">CAD</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Number of NFTs</th>
            <th>Total Estimated Cost</th>
          </tr>
        </thead>
        <tbody>{renderNFTOptions()}</tbody>
      </table>
    </div>
  );
};

export default GasPriceCalculator;
