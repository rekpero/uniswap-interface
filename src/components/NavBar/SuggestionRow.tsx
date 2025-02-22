import clsx from 'clsx'
import uriToHttp from 'lib/utils/uriToHttp'
import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import { vars } from 'nft/css/sprinkles.css'
import { useSearchHistory } from 'nft/hooks'
// import { fetchSearchCollections, fetchTrendingCollections } from 'nft/queries'
import { FungibleToken, GenieCollection } from 'nft/types'
import { ethNumberStandardFormatter } from 'nft/utils/currency'
import { putCommas } from 'nft/utils/putCommas'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { TokenWarningRedIcon, VerifiedIcon } from '../../nft/components/icons'
import * as styles from './SearchBar.css'

interface CollectionRowProps {
  collection: GenieCollection
  isHovered: boolean
  setHoveredIndex: (index: number | undefined) => void
  toggleOpen: () => void
  index: number
}

export const CollectionRow = ({ collection, isHovered, setHoveredIndex, toggleOpen, index }: CollectionRowProps) => {
  const [brokenImage, setBrokenImage] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const addToSearchHistory = useSearchHistory(
    (state: { addItem: (item: FungibleToken | GenieCollection) => void }) => state.addItem
  )
  const navigate = useNavigate()

  const handleClick = useCallback(() => {
    addToSearchHistory(collection)
    toggleOpen()
  }, [addToSearchHistory, collection, toggleOpen])

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isHovered) {
        event.preventDefault()
        navigate(`/nfts/collection/${collection.address}`)
        handleClick()
      }
    }
    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [toggleOpen, isHovered, collection, navigate, handleClick])

  return (
    <Link
      to={`/nfts/collection/${collection.address}`}
      onClick={handleClick}
      onMouseEnter={() => !isHovered && setHoveredIndex(index)}
      onMouseLeave={() => isHovered && setHoveredIndex(undefined)}
      className={styles.suggestionRow}
      style={{ background: isHovered ? vars.color.lightGrayButton : 'none' }}
    >
      <Row style={{ width: '68%' }}>
        {!brokenImage && collection.imageUrl ? (
          <Box
            as="img"
            src={collection.imageUrl}
            alt={collection.name}
            className={clsx(loaded ? styles.suggestionImage : styles.imageHolder)}
            onError={() => setBrokenImage(true)}
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <Box className={styles.imageHolder} />
        )}
        <Column className={styles.suggestionPrimaryContainer}>
          <Row gap="4" width="full">
            <Box className={styles.primaryText}>{collection.name}</Box>
            {collection.isVerified && <VerifiedIcon className={styles.suggestionIcon} />}
          </Row>
          <Box className={styles.secondaryText}>{putCommas(collection.stats.total_supply)} items</Box>
        </Column>
      </Row>
      {collection.floorPrice && (
        <Column className={styles.suggestionSecondaryContainer}>
          <Row gap="4">
            <Box className={styles.primaryText}>{ethNumberStandardFormatter(collection.floorPrice)} ETH</Box>
          </Row>
          <Box className={styles.secondaryText}>Floor</Box>
        </Column>
      )}
    </Link>
  )
}

interface TokenRowProps {
  token: FungibleToken
  isHovered: boolean
  setHoveredIndex: (index: number | undefined) => void
  toggleOpen: () => void
  index: number
}

export const TokenRow = ({ token, isHovered, setHoveredIndex, toggleOpen, index }: TokenRowProps) => {
  const [brokenImage, setBrokenImage] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const addToSearchHistory = useSearchHistory(
    (state: { addItem: (item: FungibleToken | GenieCollection) => void }) => state.addItem
  )
  const navigate = useNavigate()

  const handleClick = useCallback(() => {
    addToSearchHistory(token)
    toggleOpen()
  }, [addToSearchHistory, toggleOpen, token])

  // Close the modal on escape
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isHovered) {
        event.preventDefault()
        navigate(`/tokens/${token.address}`)
        handleClick()
      }
    }
    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [toggleOpen, isHovered, token, navigate, handleClick])

  return (
    <Link
      // TODO connect with explore token URI
      to={`/tokens/${token.address}`}
      onClick={handleClick}
      onMouseEnter={() => !isHovered && setHoveredIndex(index)}
      onMouseLeave={() => isHovered && setHoveredIndex(undefined)}
      className={styles.suggestionRow}
      style={{ background: isHovered ? vars.color.lightGrayButton : 'none' }}
    >
      <Row>
        {!brokenImage && token.logoURI ? (
          <Box
            as="img"
            src={token.logoURI.includes('ipfs://') ? uriToHttp(token.logoURI)[0] : token.logoURI}
            alt={token.name}
            className={clsx(loaded ? styles.suggestionImage : styles.imageHolder)}
            onError={() => setBrokenImage(true)}
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <Box className={styles.imageHolder} />
        )}
        <Column className={styles.suggestionPrimaryContainer}>
          <Row gap="4" width="full">
            <Box className={styles.primaryText}>{token.name}</Box>
            {token.onDefaultList ? (
              <VerifiedIcon className={styles.suggestionIcon} />
            ) : (
              <TokenWarningRedIcon className={styles.suggestionIcon} />
            )}
          </Row>
          <Box className={styles.secondaryText}>{token.symbol}</Box>
        </Column>
      </Row>

      <Column className={styles.suggestionSecondaryContainer}>
        {token.priceUsd && (
          <Row gap="4">
            <Box className={styles.primaryText}>{ethNumberStandardFormatter(token.priceUsd, true)}</Box>
          </Row>
        )}
        {token.price24hChange && (
          <Box className={styles.secondaryText} color={token.price24hChange >= 0 ? 'green400' : 'red400'}>
            {token.price24hChange.toFixed(2)}%
          </Box>
        )}
      </Column>
    </Link>
  )
}

export const SkeletonRow = () => {
  return (
    <Box className={styles.searchBarDropdown}>
      <Row className={styles.suggestionRow}>
        <Row>
          <Box className={styles.imageHolder} />
          <Box borderRadius="round" height="16" width="160" background="loading" />
        </Row>
      </Row>
    </Box>
  )
}
