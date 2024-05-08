


export const gameState: {
  scenes: string[]
  nextScene: string;
  currentScene: string;
  levelCoins: number;
  setNextScene: (scene: string) => void;
  setCurrentScene: (scene: string) => void;
  isLevelComplete: () => boolean;
} = {
  scenes: ["level-1", "level-2"],
  nextScene: "",
  currentScene: "level-1",
  levelCoins: 0,
  setCurrentScene(sceneName: string) {
    if (this.scenes.includes(sceneName)) {
      this.currentScene = sceneName;
    }
  },
  setNextScene(sceneName: string) {
    if (this.scenes.includes(sceneName)) {
      this.nextScene = sceneName;
    }
  },
  isLevelComplete() {
    return this.levelCoins === 0;
  }
}