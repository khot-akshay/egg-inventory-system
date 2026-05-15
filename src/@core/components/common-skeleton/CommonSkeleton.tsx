import React from 'react'
import { Skeleton, Box, SkeletonProps } from '@mui/material'

interface CommonSkeletonProps extends Omit<SkeletonProps, 'variant'> {
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded' | 'tag'
    count?: number
    width?: string | number
    height?: string | number
    gap?: number
}

const CommonSkeleton: React.FC<CommonSkeletonProps> = ({
    variant = 'text',
    count = 1,
    width,
    height,
    gap = 1,
    sx,
    ...rest
}) => {
    const renderSkeleton = () => {
        if (variant === 'tag') {
            return (
                <Skeleton
                    variant="rounded"
                    width={width || 60}
                    height={height || 24}
                    sx={{ borderRadius: '6px', ...sx }}
                    {...rest}
                />
            )
        }

        return (
            <Skeleton
                variant={variant as any}
                width={width}
                height={height}
                sx={sx}
                {...rest}
            />
        )
    }

    if (count > 1) {
        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap }}>
                {Array.from({ length: count }).map((_, index) => (
                    <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
                ))}
            </Box>
        )
    }

    return renderSkeleton()
}

export default CommonSkeleton
