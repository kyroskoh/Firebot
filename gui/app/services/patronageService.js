'use strict';


(function() {

    angular
        .module('firebotApp')
        .factory('patronageService', function ($rootScope, logger, listenerService) {
            let service = {};

            service.dataLoaded = false;
            service.patronageData = {
                channel: null,
                period: null
            };

            service.percentageToNextMilestone = 0;
            service.percentageOfCurrentMilestoneGroup = 0;

            function getPercentageToNextMilestone() {
                let percentCompleted = 0;

                if (service.dataLoaded) {
                    let periodData = service.patronageData.period;
                    let channelData = service.patronageData.channel;

                    let currentMilestoneId = channelData.currentMilestoneId;
                    let previousMilestoneId = channelData.currentMilestoneId - 1;

                    let milestoneGroup = periodData.milestoneGroups
                        .find(mg => mg.id === channelData.currentMilestoneGroupId);

                    if (milestoneGroup) {
                        let currentMilestone = milestoneGroup.milestones.find(m => m.id === currentMilestoneId);

                        let previousTarget = 0;
                        let previousMilestone = milestoneGroup.milestones.find(m => m.id === previousMilestoneId);
                        if (previousMilestone) {
                            previousTarget = previousMilestone.target;
                        }

                        if (currentMilestone) {
                            let currentTarget = currentMilestone.target;

                            let patronageEarned = channelData.patronageEarned;
                            if (patronageEarned > currentTarget) {
                                percentCompleted = 100;
                            } else {
                                percentCompleted = (patronageEarned - previousTarget) / (currentTarget - previousTarget);
                            }
                        }
                    }
                }

                return percentCompleted;
            }

            function getPercentageOfCurrentMilestoneGroup() {
                let percentCompleted = 0;

                if (service.dataLoaded) {
                    let channelData = service.patronageData.channel;
                    let periodData = service.patronageData.period;

                    let currentMilestoneGroup = periodData.milestoneGroups
                        .find(mg => mg.id === channelData.currentMilestoneGroupId);

                    if (currentMilestoneGroup) {

                        let lastMilestone =
                            currentMilestoneGroup.milestones[currentMilestoneGroup.milestones.length - 1];

                        if (channelData.patronageEarned >= lastMilestone.target) {
                            return 1;
                        }


                        let completedMilestoneCount = currentMilestoneGroup.milestones
                            .filter(m => m.id < channelData.currentMilestoneId)
                            .length;

                        let milestonesCount = currentMilestoneGroup.milestones.length;

                        let completedPercentage = completedMilestoneCount / milestonesCount;

                        let currentMilestonePercentage = getPercentageToNextMilestone();

                        let scaledPercentage = completedPercentage + (1 / milestonesCount * currentMilestonePercentage);

                        return scaledPercentage;
                    }
                }

                return percentCompleted;
            }

            service.getCurrentMilestoneGroup = () => {
                if (service.dataLoaded) {
                    return service.patronageData.period.milestoneGroups
                        .find(mg => mg.id === service.patronageData.channel.currentMilestoneGroupId);
                }
                return { milestones: []};
            };

            service.getCurrentMilestone = () => {
                if (service.dataLoaded) {
                    let milestoneGroup = service.getCurrentMilestoneGroup();
                    return milestoneGroup.milestones.find(m => m.id === service.patronageData.channel.currentMilestoneId);
                }
                return null;
            };

            service.recalucatePercentages = () => {
                service.percentageToNextMilestone = Math.floor(getPercentageToNextMilestone() * 100);
                service.percentageOfCurrentMilestoneGroup = Math.floor(getPercentageOfCurrentMilestoneGroup() * 100);
            };

            function setData(patronageData) {
                if (patronageData == null) return;
                service.patronageData = patronageData;
                if (service.patronageData.channel != null && service.patronageData.period != null) {
                    service.dataLoaded = true;
                    service.recalucatePercentages();
                } else {
                    service.dataLoaded = false;
                }
            }

            service.updateData = () => {
                let data = listenerService.fireEventSync("getPatronageData");
                setData(data);
            };

            listenerService.registerListener(
                { type: listenerService.ListenerType.CHANNEL_PATRONAGE_UPDATE},
                (channelData) => {
                    if (channelData == null) return;

                    service.patronageData.channel = channelData;

                    if (!service.dataLoaded) {
                        let data = listenerService.fireEventSync("getPatronageData");

                        if (data != null && data.period != null) {
                            service.patronageData.period = data.period;

                            service.dataLoaded = true;
                        }

                    }
                    service.recalucatePercentages();
                    $rootScope.$broadcast("patronageUpdated");
                });

            listenerService.registerListener(
                { type: listenerService.ListenerType.PERIOD_PATRONAGE_UPDATE},
                (data) => {
                    service.patronageData.period = data;
                    service.recalucatePercentages();
                    $rootScope.$broadcast("patronageUpdated");
                });


            service.updateData();

            return service;
        });
}(window.angular));
