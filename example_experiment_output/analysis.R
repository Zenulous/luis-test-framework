library(ggplot2)
library(dplyr)
library(ggpubr)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
allEntitiesExp <- read.csv("parameterAgnosticComplexityExperiment.csv", na.strings="", stringsAsFactors = FALSE, encoding="UTF-8")
View(allEntitiesExp)
allEntitiesExp[allEntitiesExp=="false"] <- 0
allEntitiesExp[allEntitiesExp=="true"] <- 1

allEntitiesRecognizedDfNoErrors <- filter(allEntitiesExp, spellingErrors == 0)[c(1,7,8)]
allEntitiesRecognizedDfErrorsNoCheck <- filter(filter(allEntitiesExp, spellingErrors == 1), luisSpellCheck == 0)[c(1,7,8)]
allEntitiesRecognizedDfErrorsCheck <- filter(filter(allEntitiesExp, spellingErrors == 1), luisSpellCheck == 1)[c(1,7,8)]

numberEntities <- c("1","2","3","4","5","6")

get_percentage_of_recognized_set <- function(x) {
  return(sum(x) / length(x) * 100)
}

intentRecognizedPDf <- data.frame(numberEntities)
intentRecognizedPDf$noSpellingError <- aggregate(as.integer(allEntitiesRecognizedDfNoErrors$intentRecognized), list(allEntitiesRecognizedDfNoErrors$numberEntities), get_percentage_of_recognized_set)[[2]]
intentRecognizedPDf$spellingErrorCheck <- aggregate(as.integer(allEntitiesRecognizedDfErrorsCheck$intentRecognized), list(allEntitiesRecognizedDfErrorsCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
intentRecognizedPDf$spellingErrorNoCheck <- aggregate(as.integer(allEntitiesRecognizedDfErrorsNoCheck$intentRecognized), list(allEntitiesRecognizedDfErrorsNoCheck$numberEntities), get_percentage_of_recognized_set)[[2]]

intentRecognizedP <- ggplot(intentRecognizedPDf, aes(x=numberEntities, group = 1)) +
  geom_line(aes(y=noSpellingError, lty="1"), size = 1.3) +
  geom_point(aes(y=noSpellingError), size = 3, pch=15) +
  geom_line(aes(y=spellingErrorNoCheck, lty="2"), size = 1.3) +
  geom_point(aes(y=spellingErrorNoCheck), size = 3, pch=15) +
  geom_line(aes(y=spellingErrorCheck, lty="3"), size = 1.3) + 
  geom_point(aes(y=spellingErrorCheck), size = 3, pch=15) + 
  ylim(70,100) +
  xlab("Number of entities") +
  ylab("Inform intent recognized (% of utterances)") + 
  ggtitle("% of utterances for which the inform intent is recognized (tN = 1,800)")  + 
  theme(plot.title = element_text(size=11)) + 
  scale_linetype_discrete(name="Condition", labels=c("A: No spelling error","B1: Spelling error without spell check","B2: Spelling error with spell check"))

intentRecognizedP


allEntitiesPDf <- data.frame(numberEntities)
allEntitiesPDf$noSpellingError<- aggregate(as.integer(allEntitiesRecognizedDfNoErrors$allEntitiesRecognized), list(allEntitiesRecognizedDfNoErrors$numberEntities), get_percentage_of_recognized_set)[[2]]
allEntitiesPDf$spellingErrorCheck<- aggregate(as.integer(allEntitiesRecognizedDfErrorsCheck$allEntitiesRecognized), list(allEntitiesRecognizedDfErrorsCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
allEntitiesPDf$spellingErrorNoCheck<- aggregate(as.integer(allEntitiesRecognizedDfErrorsNoCheck$allEntitiesRecognized), list(allEntitiesRecognizedDfErrorsNoCheck$numberEntities), get_percentage_of_recognized_set)[[2]]


allEntitiesP <- ggplot(allEntitiesPDf, aes(x=numberEntities, group = 1)) +
  geom_line(aes(y=noSpellingError, lty="1"), size = 1.3) +
  geom_point(aes(y=noSpellingError), size = 3, pch=15) +
  geom_line(aes(y=spellingErrorNoCheck, lty="2"), size = 1.3) +
  geom_point(aes(y=spellingErrorNoCheck), size = 3, pch=15) +
  geom_line(aes(y=spellingErrorCheck, lty="3"), size = 1.3) + 
  geom_point(aes(y=spellingErrorCheck), size = 3, pch=15) + 
  ylim(0,100) +
  xlab("Number of entities") +
  ylab("All entities recognized (% of utterances)") + 
  ggtitle("% of utterances for which all entities are recognized (tN = 1,800)")  + 
  theme(plot.title = element_text(size=11)) + 
  scale_linetype_discrete(name="Condition", labels=c("A: No spelling error","B1: Spelling error without spell check","B2: Spelling error with spell check"))

allEntitiesP

originCityExp <- read.csv("parameterAwareComplexityExperiment-Parameter1.csv", na.strings="", stringsAsFactors = FALSE, encoding="UTF-8")
originCityExp[originCityExp=="false"] <- 0
originCityExp[originCityExp=="true"] <- 1
originCityDfNoErrors <- filter(originCityExp, spellingErrors == 0)[c(8,9)]
originCityDfErrorsNoCheck <- filter(filter(originCityExp, spellingErrors == 1), luisSpellCheck == 0)[c(8,9)]
originCityDfErrorsCheck <- filter(filter(originCityExp, spellingErrors == 1), luisSpellCheck == 1)[c(8,9)]

destinationCityExp <- read.csv("parameterAwareComplexityExperiment-Parameter2.csv", na.strings="", stringsAsFactors = FALSE, encoding="UTF-8")
destinationCityExp[destinationCityExp=="false"] <- 0
destinationCityExp[destinationCityExp=="true"] <- 1
destinationCityDfNoErrors <- filter(destinationCityExp, spellingErrors == 0)[c(8,10)]
destinationCityDfErrorsNoCheck <- filter(filter(destinationCityExp, spellingErrors == 1), luisSpellCheck == 0)[c(8,10)]
destinationCityDfErrorsCheck <- filter(filter(destinationCityExp, spellingErrors == 1), luisSpellCheck == 1)[c(8,10)]

budgetExp <- read.csv("parameterAwareComplexityExperiment-Parameter3.csv", na.strings="", stringsAsFactors = FALSE, encoding="UTF-8")
budgetExp[budgetExp=="false"] <- 0
budgetExp[budgetExp=="true"] <- 1
budgetDfNoErrors <- filter(budgetExp, spellingErrors == 0)[c(8,11)]
budgetDfErrorsNoCheck <- filter(filter(budgetExp, spellingErrors == 1), luisSpellCheck == 0)[c(8,11)]
budgetDfErrorsCheck <- filter(filter(budgetExp, spellingErrors == 1), luisSpellCheck == 1)[c(8,11)]


startDateExp <- read.csv("parameterAwareComplexityExperiment-Parameter4.csv", na.strings="", stringsAsFactors = FALSE, encoding="UTF-8")
startDateExp[startDateExp=="false"] <- 0
startDateExp[startDateExp=="true"] <- 1
startDateDfNoErrors <- filter(startDateExp, spellingErrors == 0)[c(8,12)]
startDateDfErrorsNoCheck <- filter(filter(startDateExp, spellingErrors == 1), luisSpellCheck == 0)[c(8,12)]
startDateDfErrorsCheck <- filter(filter(startDateExp, spellingErrors == 1), luisSpellCheck == 1)[c(8,12)]


numberOfChildrenExp <- read.csv("parameterAwareComplexityExperiment-Parameter5.csv", na.strings="", stringsAsFactors = FALSE, encoding="UTF-8")
numberOfChildrenExp[numberOfChildrenExp=="false"] <- 0
numberOfChildrenExp[numberOfChildrenExp=="true"] <- 1
numberOfChildrenDfNoErrors <- filter(numberOfChildrenExp, spellingErrors == 0)[c(8,13)]
numberOfChildrenDfErrorsNoCheck <- filter(filter(numberOfChildrenExp, spellingErrors == 1), luisSpellCheck == 0)[c(8,13)]
numberOfChildrenDfErrorsCheck <- filter(filter(numberOfChildrenExp, spellingErrors == 1), luisSpellCheck == 1)[c(8,13)]


numberOfAdultsExp <- read.csv("parameterAwareComplexityExperiment-Parameter6.csv", na.strings="", stringsAsFactors = FALSE, encoding="UTF-8")
numberOfAdultsExp[numberOfAdultsExp=="false"] <- 0
numberOfAdultsExp[numberOfAdultsExp=="true"] <- 1
numberOfAdultsDfNoErrors <- filter(numberOfAdultsExp, spellingErrors == 0)[c(8,14)]
numberOfAdultsDfErrorsNoCheck <- filter(filter(numberOfAdultsExp, spellingErrors == 1), luisSpellCheck == 0)[c(8,14)]
numberOfAdultsDfErrorsCheck <- filter(filter(numberOfAdultsExp, spellingErrors == 1), luisSpellCheck == 1)[c(8,14)]


separateEntitiesNoErrorsPDf <- data.frame(numberEntities)

separateEntitiesNoErrorsPDf$originCity <- aggregate(as.integer(originCityDfNoErrors$originCity), list(originCityDfNoErrors$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesNoErrorsPDf$destinationCity <- aggregate(as.integer(destinationCityDfNoErrors$destinationCity), list(destinationCityDfNoErrors$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesNoErrorsPDf$budget <- aggregate(as.integer(budgetDfNoErrors$budget), list(budgetDfNoErrors$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesNoErrorsPDf$startDate <- aggregate(as.integer(startDateDfNoErrors$startDate), list(startDateDfNoErrors$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesNoErrorsPDf$numberOfChildren <- aggregate(as.integer(numberOfChildrenDfNoErrors$numberChildren), list(numberOfChildrenDfNoErrors$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesNoErrorsPDf$numberOfAdults <- aggregate(as.integer(numberOfAdultsDfNoErrors$numberAdults), list(numberOfAdultsDfNoErrors$numberEntities), get_percentage_of_recognized_set)[[2]]

separateEntityLegendName = "Entity Type"
separateEntityLegendLabels = c("Origin City", "Destination City", "Budget", "Start Date", "Number of Children", "Number of Adults")
colours <- c("blue","red","yellow","green","black","purple")
ltys <- c(1,2,3,4,5,6)

separateEntitiesNoErrorsP <- ggplot(separateEntitiesNoErrorsPDf, aes(x=numberEntities, group = 1)) +
  geom_line(aes(y=originCity, lty="1", color="1"), size = 1.3) +
  geom_point(aes(y=originCity, color="1"), size = 3, pch=15) +
  geom_line(aes(y=destinationCity, lty="2", color="2"), size = 1.3) +
  geom_point(aes(y=destinationCity, color="2"), size = 3, pch=15) +
  geom_line(aes(y=budget, lty="3", color= "3"), size = 1.3) +
  geom_point(aes(y=budget, color="3"), size = 3, pch=15) +
  geom_line(aes(y=startDate, lty="4", color="4"), size = 1.3) +
  geom_point(aes(y=startDate, color="4"), size = 3, pch=15) +
  geom_line(aes(y=numberOfChildren, lty="5", color="5"), size = 1.3) +
  geom_point(aes(y=numberOfChildren, color="5"), size = 4, pch=15) +
  geom_line(aes(y=numberOfAdults, lty="6", color="6"), size = 1.3) +
  geom_point(aes(y=numberOfAdults, color="6"), size = 2, pch=15) +
  ylim(0,100) +
  xlab("Number of entities") +
  ylab("Specific entity recognized (% of utterances)") + 
  ggtitle("% of utterances for which a specific entity was recognized
without spelling errors (tN = 10,800)")  + 
  theme(plot.title = element_text(size=11)) +
  guides(colour = guide_legend(override.aes = list(shape = NA))) +
  scale_color_manual(name=separateEntityLegendName, labels=separateEntityLegendLabels, values=colours) +
  scale_linetype_manual(name=separateEntityLegendName, labels=separateEntityLegendLabels, values=ltys)

separateEntitiesErrorsNoCheck <- data.frame(numberEntities)

separateEntitiesErrorsNoCheck$originCity <- aggregate(as.integer(originCityDfErrorsNoCheck$originCity), list(originCityDfErrorsNoCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesErrorsNoCheck$destinationCity <- aggregate(as.integer(destinationCityDfErrorsNoCheck$destinationCity), list(destinationCityDfErrorsNoCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesErrorsNoCheck$budget <- aggregate(as.integer(budgetDfErrorsNoCheck$budget), list(budgetDfErrorsNoCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesErrorsNoCheck$startDate <- aggregate(as.integer(startDateDfErrorsNoCheck$startDate), list(startDateDfErrorsNoCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesErrorsNoCheck$numberOfChildren <- aggregate(as.integer(numberOfChildrenDfErrorsNoCheck$numberChildren), list(numberOfChildrenDfErrorsNoCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesErrorsNoCheck$numberOfAdults <- aggregate(as.integer(numberOfAdultsDfErrorsNoCheck$numberAdults), list(numberOfAdultsDfErrorsNoCheck$numberEntities), get_percentage_of_recognized_set)[[2]]

separateEntitiesErrorsNoCheckP <- ggplot(separateEntitiesErrorsNoCheck, aes(x=numberEntities, group = 1)) +
  geom_line(aes(y=originCity, lty="1", color="1"), size = 1.3) +
  geom_point(aes(y=originCity, color="1"), size = 3, pch=15) +
  geom_line(aes(y=destinationCity, lty="2", color="2"), size = 1.3) +
  geom_point(aes(y=destinationCity, color="2"), size = 3, pch=15) +
  geom_line(aes(y=budget, lty="3", color= "3"), size = 1.3) +
  geom_point(aes(y=budget, color="3"), size = 3, pch=15) +
  geom_line(aes(y=startDate, lty="4", color="4"), size = 1.3) +
  geom_point(aes(y=startDate, color="4"), size = 3, pch=15) +
  geom_line(aes(y=numberOfChildren, lty="5", color="5"), size = 1.3) +
  geom_point(aes(y=numberOfChildren, color="5"), size = 3, pch=15) +
  geom_line(aes(y=numberOfAdults, lty="6", color="6"), size = 1.3) +
  geom_point(aes(y=numberOfAdults, color="6"), size = 3, pch=15) +
  ylim(0,100) +
  xlab("Number of entities") +
  ylab("Specific entity recognized (% of utterances)") + 
  ggtitle("% of utterances for which a specific entity was recognized
with spelling errors, without spell check (tN = 10,800)")  + 
  theme(plot.title = element_text(size=11)) + 
  guides(colour = guide_legend(override.aes = list(shape = NA))) +
  scale_color_manual(name=separateEntityLegendName, labels=separateEntityLegendLabels, values=colours) +
  scale_linetype_manual(name=separateEntityLegendName, labels=separateEntityLegendLabels, values=ltys)

separateEntitiesErrorsCheck <- data.frame(numberEntities)

separateEntitiesErrorsCheck$originCity <- aggregate(as.integer(originCityDfErrorsCheck$originCity), list(originCityDfErrorsCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesErrorsCheck$destinationCity <- aggregate(as.integer(destinationCityDfErrorsCheck$destinationCity), list(destinationCityDfErrorsCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesErrorsCheck$budget <- aggregate(as.integer(budgetDfErrorsCheck$budget), list(budgetDfErrorsCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesErrorsCheck$startDate <- aggregate(as.integer(startDateDfErrorsCheck$startDate), list(startDateDfErrorsCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesErrorsCheck$numberOfChildren <- aggregate(as.integer(numberOfChildrenDfErrorsCheck$numberChildren), list(numberOfChildrenDfErrorsCheck$numberEntities), get_percentage_of_recognized_set)[[2]]
separateEntitiesErrorsCheck$numberOfAdults <- aggregate(as.integer(numberOfAdultsDfErrorsCheck$numberAdults), list(numberOfAdultsDfErrorsCheck$numberEntities), get_percentage_of_recognized_set)[[2]]

separateEntitiesErrorsCheckP <- ggplot(separateEntitiesErrorsCheck, aes(x=numberEntities, group = 1)) +
  geom_line(aes(y=originCity, lty="1", color="1"), size = 1.3) +
  geom_point(aes(y=originCity, color="1"), size = 3, pch=15) +
  geom_line(aes(y=destinationCity, lty="2", color="2"), size = 1.3) +
  geom_point(aes(y=destinationCity, color="2"), size = 3, pch=15) +
  geom_line(aes(y=budget, lty="3", color= "3"), size = 1.3) +
  geom_point(aes(y=budget, color="3"), size = 3, pch=15) +
  geom_line(aes(y=startDate, lty="4", color="4"), size = 1.3) +
  geom_point(aes(y=startDate, color="4"), size = 3, pch=15) +
  geom_line(aes(y=numberOfChildren, lty="5", color="5"), size = 1.3) +
  geom_point(aes(y=numberOfChildren, color="5"), size = 3, pch=15) +
  geom_line(aes(y=numberOfAdults, lty="6", color="6"), size = 1.3) +
  geom_point(aes(y=numberOfAdults, color="6"), size = 3, pch=15) +
  ylim(0,100) +
  xlab("Number of entities") +
  ylab("Specific entity recognized (% of utterances)") + 
  ggtitle("% of utterances for which a specific entity was recognized in a sentence with X Number of entities
with spelling errors, with spell check (tN = 10,800)")  + 
  theme(plot.title = element_text(size=11)) + 
  guides(colour = guide_legend(override.aes = list(shape = NA))) +
  scale_color_manual(name=separateEntityLegendName, labels=separateEntityLegendLabels, values=colours) +
  scale_linetype_manual(name=separateEntityLegendName, labels=separateEntityLegendLabels, values=ltys)

ggarrange(separateEntitiesNoErrorsP + ggtitle("A: no spelling error (tN = 10,800)") + theme(legend.position = "none", strip.text=element_blank()), separateEntitiesErrorsNoCheckP + ggtitle("B1: spelling error without spell check (tN = 10,800)")  +  theme(legend.position = "none", strip.text=element_blank()), separateEntitiesErrorsCheckP + ggtitle("B2: spelling error with spell check (tN = 10,800)") + theme(legend.position = "none", strip.text=element_blank()) )