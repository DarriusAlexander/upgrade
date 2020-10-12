import React, { useMemo } from 'react'
import { Transition, animated } from 'react-spring/renderprops'
import { css, keyframes } from 'styled-components'
// @ts-ignore
import { GU, IconCheck, IconCross, textStyle, useTheme } from '@aragon/ui'
import Illustration from './Illustration'
import { springs } from '../../../style/springs'
import { useDisableAnimation } from '../../../hooks/useDisableAnimation'
import { StepStatus } from '../types'

const STATUS_ICONS: { [key: string]: string } = {
  error: IconCross,
  success: IconCheck,
}

const AnimatedDiv = animated.div

const spinAnimation = css`
  mask-image: linear-gradient(35deg, rgba(0, 0, 0, 0.1) 10%, rgba(0, 0, 0, 1));
  animation: ${keyframes`
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  `} 1.25s linear infinite;
`

const pulseAnimation = css`
  animation: ${keyframes`
    from {
      opacity: 1;
    }

    to {
      opacity: 0.1;
    }
  `} 0.75s linear alternate infinite;
`

type StatusVisualProps = {
  status: StepStatus
  color: string
  number: number
}

function StatusVisual({
  status,
  color,
  number,
  ...props
}: StatusVisualProps): JSX.Element {
  const theme = useTheme()
  const [animationDisabled, enableAnimation] = useDisableAnimation()

  const [statusIcon, illustration] = useMemo(() => {
    const Icon = STATUS_ICONS[status]

    return [
      Icon && <Icon />,
      <StepIllustration number={number} status={status} />,
    ]
  }, [status, number])

  return (
    <div
      css={`
        font-size: ${14 * GU}px;
        display: flex;
        position: relative;
        // Using 'em' units allows us to uniformly scale the graphic via 'font-size' without having to manage individual dimensions.
        width: 1em;
        height: 1em;
      `}
      {...props}
    >
      <div
        css={`
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
        `}
      >
        <div
          css={`
            position: relative;
            z-index: 1;
          `}
        >
          <div
            css={`
              position: absolute;
              bottom: ${0.5 * GU}px;
              right: 0;
            `}
          >
            <Transition
              config={(_, state) =>
                state === 'enter' ? springs.gentle : springs.instant
              }
              items={statusIcon}
              onStart={enableAnimation}
              immediate={animationDisabled}
              from={{
                scale: 1.3,
              }}
              enter={{
                opacity: 1,
                scale: 1,
              }}
              leave={{
                position: 'absolute' as const,
                opacity: 0,
              }}
              native
            >
              {(currentStatusIcon) => (animProps) =>
                currentStatusIcon && (
                  <AnimatedDiv
                    css={`
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      border-radius: 100%;
                      padding: ${0.25 * GU}px;
                      background-color: ${theme.surface};
                      color: ${color};
                      border: 2px solid currentColor;
                      bottom: 0;
                      right: 0;
                    `}
                    style={{
                      ...animProps,
                      // Prevent rasterization artifacts by removing transform once animation has completed
                      // Current spring version has misaligned typings on 'interpolate'
                      // @ts-ignore
                      transform: animProps.scale.interpolate((scale: number) =>
                        scale !== 1 ? `scale3d(${scale}, ${scale}, 1)` : 'none'
                      ),
                    }}
                  >
                    {currentStatusIcon}
                  </AnimatedDiv>
                )}
            </Transition>
          </div>

          {illustration}
        </div>
        <div
          css={`
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;

            border-radius: 100%;
            border: 2px solid ${status === 'waiting' ? 'transparent' : color};

            ${status === 'prompting' ? pulseAnimation : ''}
            ${status === 'working' ? spinAnimation : ''}
            ${status === 'prompting'
              ? `background-color: ${theme.background};`
              : ''}
          `}
        />
      </div>
    </div>
  )
}

type StepIllustrationProps = {
  number: number
  status: StepStatus
}

function StepIllustration({ number, status }: StepIllustrationProps) {
  const theme = useTheme()

  const illustrationMode = useMemo(() => {
    if (status === 'error') {
      return 'negative'
    }

    if (status === 'success') {
      return 'positive'
    }

    return 'neutral'
  }, [status])

  const renderIllustration =
    status === 'working' || status === 'error' || status === 'success'

  return (
    <div
      css={`
        width: 0.65em;
        height: 0.65em;
      `}
    >
      {renderIllustration ? (
        <Illustration mode={illustrationMode} index={number} />
      ) : (
        <div
          css={`
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${theme.surfaceOpened};
            height: 100%;
            border-radius: 100%;
            color: ${theme.accentContent};

            ${textStyle('title3')}
            font-weight: 600;
          `}
        >
          {number}
        </div>
      )}
    </div>
  )
}

export default StatusVisual
