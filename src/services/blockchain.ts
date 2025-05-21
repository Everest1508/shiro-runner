import { ethers, JsonRpcSigner, JsonRpcProvider } from 'ethers';
import ShiroABI from '../ShiroABI.json';

const { contractAddress, contractABI } = ShiroABI;

/**
 * Get contract instance
 */
export const getContract = (signerOrProvider: JsonRpcSigner | JsonRpcProvider) => {
  return new ethers.Contract(contractAddress, contractABI, signerOrProvider);
};

/**
 * Store score on the blockchain
 */
export const storeScore = async (signer: JsonRpcSigner, score: number): Promise<boolean> => {
  try {
    const contract = getContract(signer);
    const tx = await contract.submitScore(score);
    console.log('Transaction sent:', tx);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error storing score:', error);
    return false;
  }
};

/**
 * Get leaderboard from the blockchain
 * @param provider ethers provider to call the contract read-only
 * @param topN how many top scores you want to fetch
 * @returns array of { address, score, timestamp }
 */
export const getLeaderboard = async (provider: JsonRpcProvider, topN: number = 10) => {
  try {
    const contract = getContract(provider);

    // Note: getLeaderboard requires the number of top scores requested (topN)
    const scores = await contract.getLeaderboard(topN);
    console.log('Raw scores from contract:', scores);


    return scores.map((entry: any) => ({
      address: entry.player,
      score: entry.score.toNumber ? entry.score.toNumber() : Number(entry.score),
      timestamp: (entry.timestamp.toNumber ? entry.timestamp.toNumber() : Number(entry.timestamp)) * 1000, // convert to ms
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

/**
 * Get the score for the current connected user
 * @param signer ethers signer (must be connected to user wallet)
 * @returns {address, score, timestamp} or null if no score
 */
export const getMyScore = async (signer: JsonRpcSigner) => {
  try {
    const contract = getContract(signer);
    const entry = await contract.getMyScore();

    // If user never scored, score will be zero, so we return null
    if (entry.score.eq(0) && entry.timestamp.eq(0)) {
      return null;
    }

    return {
      address: entry.player,
      score: entry.score.toNumber ? entry.score.toNumber() : Number(entry.score),
      timestamp: (entry.timestamp.toNumber ? entry.timestamp.toNumber() : Number(entry.timestamp)) * 1000,
    };
  } catch (error) {
    console.error('Error fetching user score:', error);
    return null;
  }
};

/**
 * Get total number of players
 * @param provider ethers provider to call contract read-only
 */
export const getTotalPlayers = async (provider: JsonRpcProvider) => {
  try {
    const contract = getContract(provider);
    const total = await contract.getTotalPlayers();
    return total.toNumber ? total.toNumber() : Number(total);
  } catch (error) {
    console.error('Error fetching total players:', error);
    return 0;
  }
};
