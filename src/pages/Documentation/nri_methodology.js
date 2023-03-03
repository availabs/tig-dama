const doc  = `
## Introduction 

 

AVAIL has been working in the CTP program to create a historical hazard loss dataset to address the shortcomings of the NCEI Storm Events data, which often doesn’t align with available data from FEMA on property damage in presidentially declared disasters. The goal of our research is to create a more accurate historical loss dataset by using both the NCEI Storm Events data and Open Fema loss data available from various programs (Housing Assistance, Public Assistance, Small Business Administration Disaster Loans Program and the National Flood Insurance Program among others).

*Top 10 Under reported Disaster Numbers based on AVAIL join of NCEI Storm Events and Open Fema Data.*
{% table %}
* disaster number
* declaration title
* Fema Reported Loss
* NCEI Reported Loss
* Difference
---
- 4085
- HURRICANE SANDY-NY
- $20,272,076,751
- $14,600,000
- $20,257,476,751
---
- 4420
- SEVERE WINTER STORM, STRAIGHT-LINE WINDS, AND FLOODING-NE
- $3,330,159,045
- $623,436,000
- $2,706,723,045
---
- 4337
- HURRICANE IRMA-FL
- $6,205,191,836
- $3,905,503,500
- $2,299,688,336
---
- 1607
- HURRICANE RITA-LA
- $2,836,079,552
- $861,240,500
- $1,974,839,052
---
- 4344
- WILDFIRES-CA
- $1,530,148,144
- $44,200,000
- $1,485,948,144
---
- 1551
- HURRICANE IVAN-FL
- $1,922,842,743
- $525,676,667
- $1,397,166,077
---
- 4020
- HURRICANE IRENE-NY
- $1,062,814,504
- $63,810,000
- $999,004,504
---
- 4263
- SEVERE STORMS AND FLOODING-LA
- $1,035,925,763
- $71,808,000
- $964,117,763
---
- 4407
- WILDFIRES-CA
- $777,578,838
- $0
- $777,578,838
---
- 1763
- SEVERE STORMS, TORNADOES, AND FLOODING-IA
- $1,892,243,709
- $1,130,161,000
- $762,082,709
{% /table %}


We recently completed the work on the first version of this fusion dataset and we wanted to see how this new dataset would impact the National Risk Index outcomes. To do this we set out to recreate your methodology for calculation historic loss rations (HLR) for each county, hazard and consequence type using both our fusion data set and the raw Storm Events data as a quality and sanity check for our implementation of the NRI methodology.

Going through the NRI documentation, our team has been very impressed with the advances made in the current release of the NRI. Calculating Expected Annual Loss from Exposure \* Frequency \* Historic Loss Ratio does a lot to make up for the shortcomings of the available data and the Bayesian weighting of historical losses ratio per basis is an excellent way to better explain historical risk given the high variance in disaster occurrence while using exposure and loss ratio per basis to account for differences in development.


We were hoping that for hazard types which have data in NCEI we would be able to get within 20% of the national estimated annual loss value for all counties using HLR values using only the NCEI data when combined with the frequency and exposure by consequence data used directly from the latest published NRI. This step was intended to make sure we could replicate the NRI methodology so that when we created HLR data with the NCEI / Open Fema fusion dataset we could understand the impact of the updated historical loss data.


# Recreating Historic Loss Ratios with NCEI Storm Events Data

To test our implementation of the National Risk Index (NRI) Historic Loss Ratio (HLR) calculation we decided to first implement the methodology using only the [NCEI Storm Events data](https://www.ncdc.noaa.gov/stormevents/). This is the dataset which NRI validates itself against and can be used to create a methodology with a direct comparison. Using the Open Fema / NCEI Fusion data described in the second part of this paper creates a number of methodological difficulties that arise from reconciling hazard types from [FEMA Declared Disasters](https://www.fema.gov/disaster/declarations) and the different shapes of reported data from Open Fema Datasources.

## Overview of Methodology for Recreating NRI Historic Loss Ration Data



### 1 - Enhancing Storm Events Data 

  The raw NCEI storm events data needs a number of post processing steps to be useable for a county level loss analysis of the 18 NRI Hazards. This includes
    
    - Mapping all events to counties, surrounding areas and regions

    - Mapping event_type to NRI hazard type

    - Converting Loss amounts to dollar value integers
    
    - Adjusting loss amounts for inflation

### 2 - Creating Per Basis Events Table

  Create a per basis events table by hazard type as perscribed by the NRI documentation using the enhanced Storm Events Data as input. This performs the loss record expansion and loss record aggregation on each event by type as perscribed Table 13 in the NRI technical documentation. Additionally for the indicated zero loss records are added to the per basis table for each county and hazard so that the total occurences for each year matches the NRI hazard frequency data. 

### 3 - Create County Level Historic Loss Ratios

  In this step the per basis events' loss values are converted to loss ratios by dividing the loss in dollars by the county level exposure values for each consequence type. Then we take the event loss ratios and perform Bayesian credibility weighting to create a final calculation for the historic loss ratio for each county and each consequence. 

### 4 - Analyzing Results

  We then take our results for HLR and combine them with exposure and frequency values to calculate the Annual Expected Loss by Hazard by consequence. We can then map and compare the data at the county level to see how our results compare to the original NRI results. We repeated this process numerous times as we attempted to replicate the published NRI results. 


The next section covers each step of the methodology with the questions that arose in attempting replication, the decisions that we made. It identifies the possible sources of difference in the outcomes from the data processing pipeline used in this paper in comparison to the NRI data.  


## Comparing Methodology for Mapping Hazard Events to NRI Hazard Types

For our first pass Initially we used the event type mapping which AVAIL developed for the 2019 New York State Hazard mitigation plan. 

#### *Table 2 - NRI Hazard to NCEI Storm Events Event Type Mapping*
{% table %}
 - NRI Hazard Type
 - NCEI Event Types
---
 - Avalanche
 - 'Avalanche'
---
 - Coastal Flood
 - 'Coastal Flood',
  'High Surf',
  'Sneakerwave',
  'Storm Surge/Tide',
  'Rip Current'
---
 - Coldwave'
 - 'Cold/Wind Chill',
'Extreme Cold/Wind Chill',
"Frost/Freeze",
       
---
- Drought
- 'Drought'
---
 - Earthquake 
 - 
---
 - Hail 
 - 'Hail',
'Marine Hail',
'TORNADOES, TSTM WIND, HAIL',
'HAIL/ICY ROADS',
'HAIL FLOODING'
---
 - Heatwave
- 'Heat',
'Excessive Heat'
---
 - Hurricane	
- 'Hurricane',
'Hurricane (Typhoon)',
'Marine Hurricane/Typhoon',
'Marine Tropical Storm',
'Tropical Storm',
'Tropical Depression',
'Marine Tropical Depression',
'Hurricane Flood'
---
 - Icestorm 
 - 'Ice Storm', 'Sleet'
---
 - Landslide: 
 - 'Landslide',
'Debris Flow'
---
 - Lightning
 - 'Lightning',
'THUNDERSTORM WINDS LIGHTNING',
"Marine Lightning"
---
 ---
 - Riverine Flooding
 - 'Flood',
'Flash Flood',
'THUNDERSTORM WINDS/FLASH FLOOD',
'THUNDERSTORM WINDS/ FLOOD',
'Lakeshore Flood',
'HAIL FLOODING'
---
  - Strong Wind
  - 'High Wind',
    'Strong Wind',
    'Marine High Wind',
    'Marine Strong Wind',
    'Marine Thunderstorm Wind',
    'Thunderstorm Wind',
    'THUNDERSTORM WINDS LIGHTNING',
    'TORNADOES, TSTM WIND, HAIL',
    'THUNDERSTORM WIND/ TREES',
    'THUNDERSTORM WINDS HEAVY RAIN',
    "Heavy Wind",
    "THUNDERSTORM WINDS/FLASH FLOOD",
    "THUNDERSTORM WINDS/ FLOOD",
    "THUNDERSTORM WINDS/HEAVY RAIN",
    "THUNDERSTORM WIND/ TREE",
    "THUNDERSTORM WINDS FUNNEL CLOU",
    "THUNDERSTORM WINDS/FLOODING"
---
- Tornado 
- 'Tornado',
'TORNADOES, TSTM WIND, HAIL',
'TORNADO/WATERSPOUT'
'Funnel Cloud'
'Waterspout'      
---
- Tsunami
- 'Tsunami',
'Seiche'     
---
- Volcanic Activity 
- 'Volcanic Ash', 'Volcanic Ashfall'     
---
- Wildfire
- 'Wildfire'
---
- Winter Weather 
- 'Winter Weather',
'Winter Storm',
'Heavy Snow',
'Blizzard',
'High Snow'
'Lake-Effect Snow'
--- 
 - Uncategorized*
 - 'Marine Dense Fog'
'OTHER",
'Dust Storm',
'Astronomical Low Tide',
'Northern Lights',
'Dense Smoke',
'Freezing Fog',
'Dust Devil',
'Heavy Rain',
'Dense Fog'

{% /table %}

The NRI uses SHELDUS data for historic hazard event data which uses data sources in addition to NCEI data for some hazards such as [Earthquake, Landslide and Volcanic Activity](https://cemhs.asu.edu/sheldus/metadata), and may use different methodologies for processing the input data than we have applied. While the [NRI technical documentation](https://www.fema.gov/sites/default/files/documents/fema_national-risk-index_technical-documentation.pdf) provides in Table 7 an excellent mapping of Sheldus Hazard Types to NRI hazard types, a similiar table from SHELDUS mapping hazard types from NCEI to Sheldus types is unavailable.

Due to these known differences and lack of direct event type mapping we started our process by checking the number of loss records our mapping produces compared to the loss records for each hazard type that are available in the NRI technical documentation. 

*Table 3 - NCEI Storm Events Loss Events compared to # NRI Loss Records and Loss (Property + Crop + Population Loss) 1996 to 2019 using category mappings*
{% table %}
---
 - NRI Hazard Type
 - NCEI Loss Events
 - NRI Loss Events
 - % Difference
 - NCEI Yrly Avg Loss (Billions)
---
- avalanche
- 422
- 1344
- 218.5
- $ 0.12 
---
- coastal
- 2610
- 818
- -68.7
- $ 2.81
---
- coldwave
- 2473
- 2857
- 15.5
- $ 0.56
---
- drought
- 4259
- 5232
- 22.8
- $ 1.23
---
- hail
- 28412
- 27552
- -3.0
- $ 1.32
---
- heatwave
- 2378
- 2611
- 9.8
- $ 1.65
---
- hurricane
- 3470
- 4708
- 35.7
- $ 6.83
---
- icestorm
- 3396
- 3888
- 14.5
- $ 0.36
---
- landslide
- 446
- 852
- 91.0
- $ 0.09
---
- lightning
- 14634
- 14439
- -1.3
- $ 0.50
---
- riverine
- 52117
- 52103
- 0.0
- $ 6.93
---
- tornado
- 17752
- 17710
- -0.2
- $ 2.85
---
- tsunami
- 55
- 28
- -49.1
- $ 0.02
---
- volcano
- 3
- 42
- 1300.0
- $ 0.00
---
- wildfire
- 2021
- 3083
- 52.5
- $ 1.43
---
- winterweat
- 19059
- 15154
- -20.5
- $ 1.16
{% /table %}

The table above shows that for half of the hazards the number of loss causing events is within 20% of the numbers reported in the hazard sections of the NRI technical documentation and a few categories are almost exact matches. There are 4 hazards which are more than 50% different, Avalanche, Coastal Flooding, Landslide and Volcanic Activity.

For Landslide and Volcanic Activity we know from the SHELDUS documentation that they are using additional data and methods for those hazard categories and so a difference is expected. 

For Avalanche, no different data source is noted in the SHELDUS documentation and there isn't any ambiguous event type categories in storm events. We are left with the question of why the two datasets have such a large difference for this hazard?

For Coastal Flooding, we were off by about 68%, and we found later in the process when we came to calculating the historic loss ratios for this hazard and using them to show estimated annual loss using NRI frequency and exposure data, that we were getting values two orders of magnitude higher than the NRI values. This is partly because Coastal Flooding is not zero loss padded and for counties with a single high loss event are disproportianately effected in the HLR calculation. However looking that the data it seemed likely that we were including a number of events in Coastal Flooding which the NRI was including in Hurricane. 

To offset this problem added a step to our category mapping in which we took all Coastal Flooding events which had the word "hurricane" in their description and changed their category to Hurricane.

*Table 4 - NCEI Storm Events Loss Events compared to # NRI Loss Records Final Coastal Flooding and Hurricane Values*
{% table %}
 ---
 - NRI Hazard Type
 - NCEI Loss Events
 - NRI Loss Events
 - % Difference
 - NCEI Yrly Avg Loss (Billions)
---
 - coastal
 - 2277  
 - 818 
 - -64.1 
 - $ 0.45
---
 - hurricane
 - 3803  
 - 4708  
 - 23.8  
 - $ 9.19

{% /table %}

This change only shifts the difference in the number of events by 5%, but it reduces the historic cost of the Coastal Flooding category events by 700% and makes our final HLR calculations much closer for both the Coastal Flooding and Hurricane categories.

Its clear that there is some methodological differences in the mapping of hazard data from storm events to NRI categories in our methodology and we will expect these differences to propogate through to our final calculations. 


## Comparing Outcomes of Per Basis Calculations

The next step in the process is to create the per basis events table which gives each event type a temporal basis for equal comparison of events. For example droughts and coldwaves which are recorded in storm events as a single event which happens over many days is made into a single event for each day of the original record with the loss spread evenly across each event. For other events multi day events are aggregated into a single event. 

*Table 4 - NRI and SWD Loss and Per Basis Loss event counts*
{% table %}
---
 - NRI Hazard Type
 - NRI Loss Events
 - NRI Per Basis Loss Events
 - SWD Loss Events
 - SWD Per Basis Loss Events
---
---
- avalanche
- 344
- 54
- 1344
- 1174
---
- coastal
- 1950
- 834
- 818
- 643
---
- coldwave
- 2160
- 2819
- 2857
- 3696
---
- drought
- 4207
- 20150
- 5232
- 145001
---
- hail
- 28412
- 16655
- 27552
- 18719
---
- heatwave
- 2187
- 966
- 2611
- 11781
---
- hurricane
- 3335
- 2708
- 4708
- 3672
---
- icestorm
- 3322
- 5629
- 3888
- 6671
---
- landslide
- 378
- 340
- 852
- 649
---
- lightning
- 14634
- 10520
- 14439
- 13232
---
- riverine
- 51846
- 98232
- 52103
- 118208
---
- tornado
- 17749
- 13013
- 17710
- 17675
---
- tsunami
- 49
- 37
- 28
- 23
---
- volcano
- 0
- 0
- 42
- 31
---
- wildfire
- 1871
- 1453
- 3083
- 2367
---
- winterweat
- 18537
- 25736
- 15154
- 25830
---
{% /table %}

 Looking at the results of our per basis calculation we see that our per basis calculations tend to have proportionally similar effects on the number of events for each hazard type as the results of the NRI per basis calculation. This is a very high level comparison however and its possible there are differences in the process.

 Additionally the NRI technical documentation doesn't publish any information on the number of zero loss events added for each hazard and doesn't report on total hazard number of events in the per basis tables, only the number of loss events. Zero loss events have a large impact on the outcome of the Bayesian credibility weighting so having more information about NRI's zero loss events would be useful for replication. 

## Comparing Outcomes of HLR Calculations

We have made a lot of progress since our first pass at implementing the NRI methodology and we are off by an order of magnitude for only for two consequences

# Recreating Historic Loss Ratios with Open Fema / NCEI Fusion Data

## Creating  Open Fema / NCEI Fusion Data Events Dataset

## Comparing Outcomes of Per Basis Calculations

Appendix: Souce Data and Methods


---


`
export default doc