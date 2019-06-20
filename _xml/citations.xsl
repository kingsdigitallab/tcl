<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="#all" version="3.0"
    xmlns="http://www.w3.org/2005/xpath-functions" xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:l="http://www.legislation.gov.uk/namespaces/legislation"
    xmlns:math="http://www.w3.org/2005/xpath-functions/math"
    xmlns:ukm="http://www.legislation.gov.uk/namespaces/metadata"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output encoding="UTF-8" method="text" />
    <!--<xsl:output method="xml" />-->

    <xsl:strip-space elements="*" />

    <xsl:template match="/">
        <xsl:variable as="node()" name="transformed-xml">
            <map>
                <array key="nodes">
                    <map>
                        <string key="id">
                            <xsl:value-of select="l:Legislation/@IdURI" />
                        </string>
                        <string key="title">
                            <xsl:value-of select="l:Legislation/ukm:Metadata/dc:title" />
                        </string>
                    </map>
                    <xsl:apply-templates select="//l:Citation" mode="nodes" />
                </array>
                <array key="links">
                    <xsl:apply-templates select="//l:Citation" mode="links">
                        <xsl:with-param name="from" select="l:Legislation/@IdURI" tunnel="yes" />
                    </xsl:apply-templates>
                </array>
            </map>
        </xsl:variable>

        <xsl:value-of select="xml-to-json($transformed-xml)" />
    </xsl:template>

    <xsl:template match="l:Citation" mode="nodes">
        <map>
            <string key="id">
                <xsl:value-of select="@URI" />
            </string>
            <string key="title">
                <xsl:call-template name="citation-title" />
            </string>
        </map>
    </xsl:template>
    
    <xsl:template name="citation-title">
        <xsl:value-of select="@Class" />
        <xsl:text>, </xsl:text>
        <xsl:value-of select="@Year" />
        <xsl:text>, </xsl:text>
        <xsl:value-of select="@Number" />
    </xsl:template>
    
    <xsl:template match="l:Citation" mode="links">
        <xsl:param name="from" tunnel="yes" />
        
        <map>
            <string key="from">
                <xsl:value-of select="$from" />
            </string>
            <map key="target">
                <string key="id">
                    <xsl:value-of select="@URI" />
                </string>
                <string key="title">
                    <xsl:call-template name="citation-title" />
                </string>
            </map>
        </map>
    </xsl:template>
</xsl:stylesheet>
