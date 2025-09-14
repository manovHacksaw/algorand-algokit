import { type Asset, Contract, GlobalState } from "@algorandfoundation/algorand-typescript"

type Proposal = {
  text: string
  votes: number
}

export class VotingApp extends Contract {
  // Store campaigns (array of campaign names)
  campaigns = GlobalState<string[]>()

  // Store proposals per campaign (map: campaignName -> array of Proposal)
  proposals = GlobalState<Record<string, Proposal[]>>()

  /**
   * Create a new campaign
   * @param campaignName
   */
  createCampaign(campaignName: string): void {
    const currentCampaigns = this.campaigns.value || []
    if (currentCampaigns.includes(campaignName)) return
    this.campaigns.value = [...currentCampaigns, campaignName]
    this.proposals.value = {
      ...(this.proposals.value || {}),
      [campaignName]: []
    }
  }

  /**
   * Add a proposal to a campaign
   * @param campaignName
   * @param proposalText
   */
  addProposal(campaignName: string, proposalText: string): void {
    const campaignProposals = this.proposals.value?.[campaignName] || []
    campaignProposals.push({ text: proposalText, votes: 0 })
    this.proposals.value = {
      ...(this.proposals.value || {}),
      [campaignName]: campaignProposals
    }
  }

  /**
   * Vote on a proposal
   * @param campaignName
   * @param proposalIndex
   * @param inFavour - true = vote up, false = vote down
   */
  vote(campaignName: string, proposalIndex: number, inFavour: boolean): void {
    const campaignProposals = this.proposals.value?.[campaignName]
    if (!campaignProposals) return
    const proposal = campaignProposals[proposalIndex]
    if (!proposal) return

    proposal.votes += inFavour ? 1 : -1
    campaignProposals[proposalIndex] = proposal

    this.proposals.value = {
      ...(this.proposals.value || {}),
      [campaignName]: campaignProposals
    }
  }

  /**
   * Get all proposals for a campaign
   * @param campaignName
   */
  getProposals(campaignName: string): Proposal[] {
    return this.proposals.value?.[campaignName] || []
  }

  /**
   * Get total votes for a specific proposal
   * @param campaignName
   * @param proposalIndex
   */
  getVotes(campaignName: string, proposalIndex: number): number {
    const campaignProposals = this.proposals.value?.[campaignName]
    if (!campaignProposals) return 0
    const proposal = campaignProposals[proposalIndex]
    return proposal?.votes || 0
  }
}
