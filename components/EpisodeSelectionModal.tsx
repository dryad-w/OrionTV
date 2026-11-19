import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, FlatList } from "react-native";
import { StyledButton } from "./StyledButton";
import { ThemedText } from "./ThemedText";
import usePlayerStore from "@/stores/playerStore";

interface EpisodeSelectionModalProps {}

export const EpisodeSelectionModal: React.FC<EpisodeSelectionModalProps> = () => {
  const { showEpisodeModal, episodes, currentEpisodeIndex, playEpisode, setShowEpisodeModal } = usePlayerStore();

  const [episodeGroupSize] = useState(30);
  const [selectedEpisodeGroup, setSelectedEpisodeGroup] = useState(Math.floor(currentEpisodeIndex / episodeGroupSize));
  const [showEpisodeTitles, setShowEpisodeTitles] = useState(false);

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
              onPress={() => setShowEpisodeTitles((visible) => !visible)}
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
            key={showEpisodeTitles ? "episode-summaries" : "episode-grid"}
            data={episodes.slice(
              selectedEpisodeGroup * episodeGroupSize,
              (selectedEpisodeGroup + 1) * episodeGroupSize
            )}
            numColumns={showEpisodeTitles ? 1 : 5}
            columnWrapperStyle={showEpisodeTitles ? undefined : styles.episodeRow}
            contentContainerStyle={styles.episodeList}
            keyExtractor={(_, index) => `episode-${selectedEpisodeGroup * episodeGroupSize + index}`}
            renderItem={({ item, index }) => {
              const absoluteIndex = selectedEpisodeGroup * episodeGroupSize + index;
              const episodeTitle = item.title || `第 ${absoluteIndex + 1} 集`;

              if (showEpisodeTitles) {
                return (
                  <StyledButton
                    onPress={() => onSelectEpisode(absoluteIndex)}
                    isSelected={currentEpisodeIndex === absoluteIndex}
                    hasTVPreferredFocus={currentEpisodeIndex === absoluteIndex}
                    disableFocusScale
                    style={[styles.episodeItem, styles.episodeSummaryItem]}
                  >
                    <View style={styles.episodeSummary}>
                      <Text style={styles.episodeSummaryIndex}>{absoluteIndex + 1}</Text>
                      <ThemedText style={styles.episodeSummaryTitle} numberOfLines={2}>
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
                  hasTVPreferredFocus={currentEpisodeIndex === absoluteIndex}
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
    width: "96%",
    alignSelf: "center",
    marginHorizontal: 0,
    marginVertical: 4,
    paddingVertical: 8,
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
