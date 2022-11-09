/**
 * interface IExperimentData
 * the experiment data interface
 */
export interface IExperimentData {
  /**
   * The id of the experiment
   */
  id: string;
  /**
   * The name of the experiment
   */
  name: string;
  /**
   * is the experiment archived
   */
  archived: boolean;
  /**
   * The attached runs of the experiment
   */
  run_count: number;
  /**
   * The date the experiment have been created at in milliseconds
   */
  created_at: number;
}

/**
 * type GetExperimentContributionsResult
 * The response type of GET /experiments/{exp_id}/activity

 */
export type GetExperimentContributionsResult = {
  /**
   * Total number of archived runs in a single experiment
   */
  num_archived_runs: number;
  /**
   * Total number of runs in a single experiment
   */
  num_runs: number;
  /**
   *  Number of active runs in a single experiment
   */
  num_active_runs: number;
  /**
   * Activity distribution by datetime (creating run, tracking etc.)
   * This data is used by the activity heatmap of experiment page of UI
   */
  activity_map: Record<string, number>;
};
