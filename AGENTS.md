# OrionTV 代理开发指南

本文件适用于整个仓库。如果子目录中存在更具体的 `AGENTS.md`，应同时遵循其规则。

## 项目背景

OrionTV 是基于 Expo 和 React Native 的 TV 应用，目标平台包括
Android TV、Apple TV、手机和平板。主要交互方式是电视遥控器，因此焦点
顺序、方向键导航和初始焦点属于产品功能要求，不能只当作视觉细节处理。

修改代码时应优先复用现有架构和实现方式：

- 页面路由位于 `app/`。
- 通用组件及 TV 专属组件位于 `components/`。
- 全局状态位于 `stores/`，当前使用 Zustand。
- API、存储和外部服务位于 `services/`。
- 可复用逻辑位于 `hooks/`。
- 测试文件位于对应模块的 `__tests__/` 目录。

## 强制规则

1. **每次完成代码修改后必须提交。**
   - 任务结束时，不得留下由代理创建或修改但尚未提交的代码。
   - 实现和验证完成后，创建一个或多个职责明确的提交。
   - 只提交与当前任务相关的文件，不得把无关的用户修改混入提交。
   - 如果用户明确要求本次不提交，以用户当次指令为准。
   - 如果因权限、冲突或其他原因无法提交，必须明确报告阻塞原因。

2. **保护现有工作。**
   - 不得丢弃、重置或覆盖与当前任务无关的修改。
   - 编辑脏文件前先读取内容，并在现有修改基础上继续工作。
   - Git 操作必须使用非交互式命令。

3. **控制修改范围。**
   - 使用能够满足需求的最小改动。
   - 优先复用已有组件、状态管理、工具函数和焦点处理模式。
   - 没有明确需要时，不进行无关重构，也不新增依赖。
   - 除用户明确要求外，不主动创建文档文件。

4. **提交前完成验证。**
   - 先运行与改动最相关的测试或检查。
   - 修改共享逻辑或多个模块时，再运行更完整的检查。
   - 区分本次修改引入的问题与仓库原有的失败。

5. **不得擅自创建或启动模拟器。**
   - 如果已有 TV 模拟器正在运行，应优先复用并进行实际调试。
   - 如果没有正在运行的模拟器，只有用户明确要求时才可启动新的模拟器。

## 标准工作流程

1. 检查仓库状态和当前分支：

   ```bash
   git status --short
   git branch --show-current
   ```

2. 编辑前先阅读相关实现、调用方和测试。

3. 按照现有项目风格完成最小范围修改。

4. 根据改动范围运行验证：

   ```bash
   npx eslint <changed-files>
   yarn typecheck
   yarn test-ci --runInBand
   ```

5. 如果修改涉及 TV 焦点、遥控器、播放控制或布局，检查已有设备：

   ```bash
   adb devices -l
   xcrun simctl list devices booted
   ```

   如果 `adb` 不在 `PATH` 中，使用
   `$ANDROID_HOME/platform-tools/adb`。对于 Android TV，可进一步检查：

   ```bash
   adb shell pm list packages | rg -i orion
   adb shell dumpsys window | rg "mCurrentFocus|mFocusedApp"
   ```

   使用遥控器按键和运行日志验证实际焦点路径：

   ```bash
   adb shell input keyevent DPAD_UP
   adb shell input keyevent DPAD_DOWN
   adb shell input keyevent DPAD_CENTER
   adb logcat -d | rg ReactNativeJS
   ```

6. 检查差异并提交：

   ```bash
   git diff --check
   git diff
   git add <task-files>
   git commit -m "<type>: <summary>"
   ```

7. 使用 `git status --short` 确认最终工作区状态。

## 提交规范

提交信息使用与仓库历史一致的 Conventional Commits 风格：

- `feat: ...`：新增用户可见功能
- `fix: ...`：修复缺陷或行为问题
- `perf: ...`：性能优化
- `refactor: ...`：不改变行为的代码结构调整
- `test: ...`：仅修改测试
- `chore: ...`：工具、配置或维护性修改

每个提交应保持职责单一，不得为了清空工作区而提交无关文件。

## TV 交互要求

- 必须支持遥控器方向键和确认键操作。
- 需要初始焦点或首选焦点时，使用 `hasTVPreferredFocus`。
- 如果异步渲染、凭据加载或状态更新会影响焦点时机，应将
  `hasTVPreferredFocus` 与基于 ref 的显式 `focus()` 配合使用。
- 不应在手机或平板上调用仅适用于 TV 的聚焦方法，除非已确认安全。
- 控件出现、消失、禁用或切换状态时，应保持合理的焦点行为。
- TV、平板和手机上的文本与控件不得重叠或超出容器。
- 修改登录弹窗或模态框焦点时，必须验证“无保存凭据”和“有保存凭据”
  两条路径。

## 验证说明

- `yarn typecheck` 当前也检查测试文件。如果只有仓库原有的测试类型错误，
  应在结果中明确列出，不得将其表述为本次修改引入的问题。
- `yarn test-ci --runInBand` 要求现有主题快照与当前深色主题一致。除非
  当前任务明确改变了对应组件的预期外观，否则不要更新无关快照。
- 单元测试无法完整验证原生 TV 焦点行为。存在已启动的 TV 模拟器时，应
  进行实际遥控器操作和运行日志验证。

## 仓库卫生

- 不得提交构建产物、覆盖率变化、本地截图、模拟器数据或临时文件。
- 除非用户明确要求，否则不新增说明文档。
- 源代码默认使用 ASCII；如果文件本身已使用中文，或界面文案需要中文，
  可以使用中文。
