import { useEffect, useRef, useCallback } from "react";
import { useTVEventHandler, HWEvent } from "react-native";
import usePlayerStore from "@/stores/playerStore";

const SEEK_INTERVAL = 200;
const BASE_SEEK_SPEED = 100;
const MAX_SEEK_SPEED = 600;
const BASE_SEEK_STEP = (SEEK_INTERVAL / 1000) * BASE_SEEK_SPEED * 1000;

// 定时器延迟时间（毫秒）
const CONTROLS_TIMEOUT = 5000;

// Ramp from 100x to 600x, then cap to avoid overshooting short videos.
const getSeekSpeed = (heldDuration: number) => {
  if (heldDuration >= 3500) return MAX_SEEK_SPEED;
  if (heldDuration >= 2000) return 400;
  if (heldDuration >= 1000) return 200;
  return BASE_SEEK_SPEED;
};

/**
 * 管理播放器控件的显示/隐藏、遥控器事件和自动隐藏定时器。
 * @returns onScreenPress - 一个函数，用于处理屏幕点击事件，以显示控件并重置定时器。
 */
export const useTVRemoteHandler = () => {
  const { showControls, setShowControls, showEpisodeModal, togglePlayPause, seek } = usePlayerStore();

  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const fastForwardIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopContinuousSeek = useCallback(() => {
    if (fastForwardIntervalRef.current) {
      clearInterval(fastForwardIntervalRef.current);
      fastForwardIntervalRef.current = null;
    }
  }, []);

  const startContinuousSeek = useCallback(
    (direction: -1 | 1) => {
      if (fastForwardIntervalRef.current) return;

      const startedAt = Date.now();

      const performSeek = () => {
        const heldDuration = Date.now() - startedAt;
        const step = (SEEK_INTERVAL / 1000) * getSeekSpeed(heldDuration) * 1000;
        seek(direction * step);
      };

      performSeek();
      fastForwardIntervalRef.current = setInterval(performSeek, SEEK_INTERVAL);
    },
    [seek]
  );

  // 重置或启动隐藏控件的定时器
  const resetTimer = useCallback(() => {
    // 清除之前的定时器
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    // 设置新的定时器
    controlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, CONTROLS_TIMEOUT);
  }, [setShowControls]);

  // 当控件显示时，启动定时器
  useEffect(() => {
    if (showControls) {
      resetTimer();
    } else {
      // 如果控件被隐藏，清除定时器
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    }

    // 组件卸载时清除定时器
    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, [showControls, resetTimer]);

  // 组件卸载时清除快进定时器
  useEffect(() => {
    return () => {
      stopContinuousSeek();
    };
  }, [stopContinuousSeek]);

  // 处理遥控器事件
  const handleTVEvent = useCallback(
    (event: HWEvent) => {
      if (showEpisodeModal) {
        stopContinuousSeek();
        return;
      }

      if (event.eventType === "longRight" || event.eventType === "longLeft") {
        if (event.eventKeyAction === 1) {
          stopContinuousSeek();
        }
      }

      resetTimer();

      if (showControls) {
        // 如果控制条已显示，则不处理后台的快进/快退等操作
        // 避免与控制条上的按钮焦点冲突
        stopContinuousSeek();
        return;
      }

      switch (event.eventType) {
        case "select":
          togglePlayPause();
          setShowControls(true);
          break;
        case "left":
          seek(-BASE_SEEK_STEP);
          break;
        case "longLeft":
          if (!fastForwardIntervalRef.current && event.eventKeyAction === 0) {
            startContinuousSeek(-1);
          }
          break;
        case "right":
          seek(BASE_SEEK_STEP);
          break;
        case "longRight":
          // 长按开始: 启动连续快进
          if (!fastForwardIntervalRef.current && event.eventKeyAction === 0) {
            startContinuousSeek(1);
          }
          break;
        case "down":
          setShowControls(true);
          break;
      }
    },
    [
      showControls,
      showEpisodeModal,
      setShowControls,
      resetTimer,
      togglePlayPause,
      seek,
      startContinuousSeek,
      stopContinuousSeek,
    ]
  );

  useTVEventHandler(handleTVEvent);

  // 处理屏幕点击事件
  const onScreenPress = () => {
    // 切换控件的显示状态
    const newShowControls = !showControls;
    setShowControls(newShowControls);

    // 如果控件变为显示状态，则重置定时器
    if (newShowControls) {
      resetTimer();
    }
  };

  return { onScreenPress };
};
