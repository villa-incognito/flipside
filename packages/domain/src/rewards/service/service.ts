import { setDay, addDays, subDays } from "date-fns";
import { Top8 } from "../top8";

export interface RewardsRepository {
  getTop8: (startDate: Date) => Promise<Top8[]>;
}

export class RewardsService {
  constructor(private readonly data: RewardsRepository) {}

  async getTop8(): Promise<Top8[]> {
    const startDate = RewardsService.getTop8StartDate();
    const top8 = await this.data.getTop8(startDate);
    return top8;
  }

  /**
   * Top 8 competitions start on Wednesday at 12pm EST
   * TODO: We should get this info from the database, and do things
   * with UTC time, since this will change when we switch to DST
   */
  static getTop8StartDate(): Date {
    let date = new Date();
    date.setUTCHours(16);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    date = setDay(date, 3); // Set to Wednesday of the current week
    if (date > new Date()) {
      date = subDays(date, 7); // Subtract 7 days to get the previous Wednesday
    }
    return date;
  }

  /**
   * Top 8 competitions ends on Wednesday at 4pm UTC
   * TODO: We should get this info from the database, and do things
   * with UTC time, since this will change when we switch to DST
   */
  static getTop8EndDate(): Date {
    let date = new Date();
    date.setUTCHours(16);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    date = setDay(date, 3); // Set to Wednesday of the current week
    if (date < new Date()) {
      date = addDays(date, 7); // add 7 days to get the next Wednesday
    }
    return date;
  }

  static top8IsHot(dashboard: Top8): boolean {
    const last18Hours = dashboard.rankingTrend.slice(-18, -1);
    const first = last18Hours[0];
    const last = last18Hours[last18Hours.length - 1];
    if (!first || !last) return false;
    const diff = first.rank - last.rank;
    if (!dashboard.rankingTrending) return false;
    return dashboard.rankingTrending < 12 && diff > 10;
  }
}
