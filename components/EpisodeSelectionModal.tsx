import React, { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, Modal, FlatList, Pressable } from "react-native";
import { StyledButton } from "./StyledButton";
import { ThemedText } from "./ThemedText";
import usePlayerStore from "@/stores/playerStore";
import { Colors } from "@/constants/Colors";

interface EpisodeSelectionModalProps {}

interface EpisodeItemProps {
  episodeNumber: number;
  title?: string;
  isSelected: boolean;
  hasTVPreferredFocus: boolean;
  onSelect: (index: number) => void;
}

const EpisodeGridItem = memo(function EpisodeGridItem({
  episodeNumber,
  isSelected,
  hasTVPreferredFocus,
  onSelect,
}: EpisodeItemProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      focusable
      hasTVPreferredFocus={hasTVPreferredFocus}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={() => onSelect(episodeNumber - 1)}
      style={[
        styles.episodeGridItem,
        isSelected && styles.episodeGridItemSelected,
        isFocused && styles.episodeGridItemFocused,
      ]}
    >
      <Text style={styles.episodeItemText}>{episodeNumber}</Text>
    </Pressable>
  );
});

const EpisodeSummaryItem = memo(function EpisodeSummaryItem({
  episodeNumber,
  title,
  isSelected,
  hasTVPreferredFocus,
  onSelect,
}: EpisodeItemProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      focusable
      hasTVPreferredFocus={hasTVPreferredFocus}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={() => onSelect(episodeNumber - 1)}
      style={[
        styles.episodeSummaryItem,
        isSelected && styles.episodeSummaryItemSelected,
        isFocused && styles.episodeSummaryItemFocused,
      ]}
    >
      <View style={styles.episodeSummary}>
        <Text style={styles.episodeSummaryIndex}>{episodeNumber}</Text>
        <ThemedText style={styles.episodeSummaryTitle} numberOfLines={1}>
          {title || `第 ${episodeNumber} 集`}
        </ThemedText>
      </View>
    </Pressable>
  );
});

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

  const onSelectEpisode = useCallback(
    (index: number) => {
      playEpisode(index);
      setShowEpisodeModal(false);
    },
    [playEpisode, setShowEpisodeModal]
  );

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
              if (showEpisodeTitles) {
                return (
                  <EpisodeSummaryItem
                    episodeNumber={absoluteIndex + 1}
                    title={item.title}
                    isSelected={currentEpisodeIndex === absoluteIndex}
                    hasTVPreferredFocus={absoluteIndex === preferredEpisodeIndex}
                    onSelect={onSelectEpisode}
                  />
                );
              }

              return (
                <EpisodeGridItem
                  episodeNumber={absoluteIndex + 1}
                  isSelected={currentEpisodeIndex === absoluteIndex}
                  hasTVPreferredFocus={absoluteIndex === preferredEpisodeIndex}
                  onSelect={onSelectEpisode}
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
  episodeGridItem: {
    width: "18%",
    minHeight: 44,
    margin: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  episodeGridItemSelected: {
    backgroundColor: Colors.dark.primary,
  },
  episodeGridItemFocused: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(119, 119, 119, 0.2)",
  },
  episodeItemText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  episodeSummaryItem: {
    width: "48%",
    height: 44,
    alignSelf: "flex-start",
    marginHorizontal: "1%",
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "center",
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  episodeSummaryItemSelected: {
    backgroundColor: Colors.dark.primary,
  },
  episodeSummaryItemFocused: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(119, 119, 119, 0.2)",
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
