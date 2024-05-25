import {
  BaseAnimationBuilder,
  ComplexAnimationBuilder,
  EntryExitAnimationFunction,
  IEntryExitAnimationBuilder,
} from 'react-native-reanimated'
import { EntryExitAnimationsValues } from 'react-native-reanimated/lib/typescript/reanimated2/layoutReanimation/animationBuilder/commonTypes'

/**
 * Roll from left animation. You can modify the behavior by chaining methods like `.springify()` or `.duration(500)`.
 *
 * You pass it to the `entering` prop on [an Animated component](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#animated-component).
 *
 * @see https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations#roll
 */
export class RollInLeft
  extends ComplexAnimationBuilder
  implements IEntryExitAnimationBuilder
{
  static presetName = 'RollInLeft'

  static createInstance<T extends typeof BaseAnimationBuilder>(
    this: T,
  ): InstanceType<T> {
    return new RollInLeft() as InstanceType<T>
  }

  build = (): EntryExitAnimationFunction => {
    const delayFunction = this.getDelayFunction()
    const [animation, config] = this.getAnimationAndConfig()
    const delay = this.getDelay()
    const callback = this.callbackV
    const initialValues = this.initialValues

    return (values: EntryExitAnimationsValues) => {
      'worklet'
      return {
        animations: {
          transform: [
            { translateX: delayFunction(delay, animation(0, config)) },
            { rotate: delayFunction(delay, animation('0deg', config)) },
          ],
        },
        initialValues: {
          transform: [
            { translateX: -values.windowWidth },
            { rotate: '-30deg' },
          ],
          ...initialValues,
        },
        callback,
      }
    }
  }
}

/**
 * Roll to right animation. You can modify the behavior by chaining methods like `.springify()` or `.duration(500)`.
 *
 * You pass it to the `exiting` prop on [an Animated component](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#animated-component).
 *
 * @see https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations#roll
 */
export class RollOutRight
  extends ComplexAnimationBuilder
  implements IEntryExitAnimationBuilder
{
  static presetName = 'RollOutRight'

  static createInstance<T extends typeof BaseAnimationBuilder>(
    this: T,
  ): InstanceType<T> {
    return new RollOutRight() as InstanceType<T>
  }

  build = (): EntryExitAnimationFunction => {
    const delayFunction = this.getDelayFunction()
    const [animation, config] = this.getAnimationAndConfig()
    const delay = this.getDelay()
    const callback = this.callbackV
    const initialValues = this.initialValues

    return (values: EntryExitAnimationsValues) => {
      'worklet'
      return {
        animations: {
          transform: [
            {
              translateX: delayFunction(
                delay,
                animation(values.windowWidth, config),
              ),
            },
            {
              translateY: delayFunction(
                delay,
                animation(values.windowHeight / 2, config),
              ),
            },
            { rotate: delayFunction(delay, animation('30deg', config)) },
          ],
          zIndex: delayFunction(delay, animation(30, config)),
          elevation: delayFunction(delay, animation(30, config)),
        },
        initialValues: {
          transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: '0deg' }],
          zIndex: 1,
          elevation: 1,
          ...initialValues,
        },
        callback,
      }
    }
  }
}
