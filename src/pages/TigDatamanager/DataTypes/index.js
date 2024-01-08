import {tig_sed_taz, tig_sed_county} from './sed'
import tiger_counties from './tiger_counties'
import tiger_censustrack from './tiger_censustrack'
import tig_acs from './tig_acs'
import tig_bpm_perfomance_measures from './bpm_performance_measures'
import upwp_projects from './upwp_projects';
import tig_project from './project'

import hubbound from './hubbound';

import tiger_full from './tiger_full'


const tigDataTypes = {
  hubbound,
  //TIG
  tig_sed_taz,
  tig_sed_county,
  tiger_counties,
  tiger_censustrack,
  tig_acs,
  tig_bpm_perfomance_measures,
  tig_project,
  upwp_projects,

  //ACS
  tiger_full

};

export default tigDataTypes

