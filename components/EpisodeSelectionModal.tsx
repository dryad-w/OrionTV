import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, FlatList } from "react-native";
import { StyledButton } from "./StyledButton";
import { ThemedText } from "./ThemedText";
import usePlayerStore from "@/stores/playerStore";

interface EpisodeSelectionModalProps {}

export const EpisodeSelectionModal: React.FC<EpisodeSelectionModalProps> = () => {
  const { showEpisodeModal, episodes, currentEpisodeIndex, playEpisode, setShowEpisodeModal } = usePlayerStore();

  const [showEpisodeTitles, setShowEpisodeTitles] = useState(false);
  const episodeGroupSize = showEpisodeTitles ? 12 : 30;
  const [selectedEpisodeGroup, setSelectedEpisodeGroup] = useState(
    Math.floor(currentEpisodeIndex / episodeGroupSize)
  );
  const groupStartIndex = selectedEpisodeGroup * episodeGroupSize;
  const groupEndIndex = Math.min(groupStartIndex + episodeGroupSize, episodes.length);
  const preferredEpisodeIndex =
    currentEpisodeIndex >= groupStartIndex && currentEpisodeIndex < groupEndIndex
      ? currentEpisodeIndex
      : groupStartIndex;

  const onToggleEpisodeTitles = () => {
    const nextShowEpisodeTitles = !showEpisodeTitles;
    const nextEpisodeGroupSize = nextShowEpisodeTitles ? 12 : 30;
    setSelectedEpisodeGroup(Math.floor(currentEpisodeIndex / nextEpisodeGroupSize));
    setShowEpisodeTitles(nextShowEpisodeTitles);
  };

  const onSelectEpisode = (index: number) => {
    playEpisode(index);
    setShowEpisodeModal(false);
  };

  const onClose = () => {
    setShowEpisodeModal(false);
  };

  return (
    <Modal visible={showEpisodeModal} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>选择剧集</Text>
            <StyledButton
              text={showEpisodeTitles ? "隐藏简介" : "显示简介"}
              onPress={onToggleEpisodeTitles}
              isSelected={showEpisodeTitles}
              style={styles.summaryToggle}
              textStyle={styles.summaryToggleText}
            />
          </View>

          {episodes.length > episodeGroupSize && (
            <View style={styles.episodeGroupContainer}>
              {Array.from({ length: Math.ceil(episodes.length / episodeGroupSize) }, (_, groupIndex) => (
                <StyledButton
                  key={groupIndex}
                  text={`${groupIndex * episodeGroupSize + 1}-${Math.min(
                    (groupIndex + 1) * episodeGroupSize,
                    episodes.length
                  )}`}
                  onPress={() => setSelectedEpisodeGroup(groupIndex)}
                  isSelected={selectedEpisodeGroup === groupIndex}
                  style={styles.episodeGroupButton}
                  textStyle={styles.episodeGroupButtonText}
                />
              ))}
            </View>
          )}
          <FlatList
            key={`${showEpisodeTitles ? "episode-summaries" : "episode-grid"}-${selectedEpisodeGroup}`}
            data={episodes.slice(
              selectedEpisodeGroup * episodeGroupSize,
              (selectedEpisodeGroup + 1) * episodeGroupSize
            )}
            numColumns={showEpisodeTitles ? 2 : 5}
            columnWrapperStyle={styles.episodeRow}
            contentContainerStyle={[
              styles.episodeList,
              showEpisodeTitles && styles.episodeSummaryList,
            ]}
            keyExtractor={(_, index) => `episode-${selectedEpisodeGroup * episodeGroupSize + index}`}
            initialNumToRender={episodeGroupSize}
            removeClippedSubviews={false}
            extraData={currentEpisodeIndex}
            renderItem={({ item, index }) => {
              const absoluteIndex = selectedEpisodeGroup * episodeGroupSize + index;
              const episodeTitle = item.title || `第 ${absoluteIndex + 1} 集`;

              if (showEpisodeTitles) {
                return (
                  <StyledButton
                    onPress={() => onSelectEpisode(absoluteIndex)}
                    isSelected={currentEpisodeIndex === absoluteIndex}
                    hasTVPreferredFocus={absoluteIndex === preferredEpisodeIndex}
                    disableFocusScale
                    style={[styles.episodeItem, styles.episodeSummaryItem]}
                  >
                    <View style={styles.episodeSummary}>
                      <Text style={styles.episodeSummaryIndex}>{absoluteIndex + 1}</Text>
                      <ThemedText style={styles.episodeSummaryTitle} numberOfLines={1}>
                        {episodeTitle}
                      </ThemedText>
                    </View>
                  </StyledButton>
                );
              }

              return (
                <StyledButton
                  text={`${absoluteIndex + 1}`}
                  onPress={() => onSelectEpisode(absoluteIndex)}
                  isSelected={currentEpisodeIndex === absoluteIndex}
                  hasTVPreferredFocus={absoluteIndex === preferredEpisodeIndex}
                  style={styles.episodeItem}
                  textStyle={styles.episodeItemText}
                />
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  modalContent: {
    width: 600,
    height: "100%",
    backgroundColor: "#111111",
    padding: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryToggle: {
    minWidth: 112,
    paddingVertical: 6,
  },
  summaryToggleText: {
    fontSize: 13,
  },
  episodeList: {
    justifyContent: "flex-start",
  },
  episodeSummaryList: {
    paddingBottom: 100,
  },
  episodeRow: {
    justifyContent: "flex-start",
  },
  episodeItem: {
    paddingVertical: 2,
    margin: 4,
    width: "18%",
  },
  episodeItemText: {
    fontSize: 14,
  },
  episodeSummaryItem: {
    width: "48%",
    height: 44,
    alignSelf: "flex-start",
    marginHorizontal: "1%",
    marginVertical: 2,
    paddingVertical: 0,
    justifyContent: "center",
  },
  episodeSummary: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  episodeSummaryIndex: {
    width: 44,
    color: "#aaa",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  episodeSummaryTitle: {
    flex: 1,
    color: "white",
    fontSize: 15,
    lineHeight: 21,
  },
  episodeGroupContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  episodeGroupButton: {
    paddingHorizontal: 6,
    margin: 8,
  },
  episodeGroupButtonText: {
    fontSize: 12,
  },
});
